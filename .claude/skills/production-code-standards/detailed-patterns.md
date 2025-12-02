# Detailed Code Patterns (Level 2)

## Design Patterns

### Repository Pattern
```typescript
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

class PostgresUserRepository implements UserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return row ? this.mapToUser(row) : null;
  }

  async save(user: User): Promise<User> {
    const result = await this.db.query(
      'INSERT INTO users (id, email, name) VALUES ($1, $2, $3) RETURNING *',
      [user.id, user.email, user.name]
    );
    return this.mapToUser(result);
  }

  private mapToUser(row: any): User {
    return new User(row.id, row.email, row.name);
  }
}
```

### Service Layer Pattern
```typescript
class UserService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService,
    private logger: Logger
  ) {}

  async registerUser(data: RegisterUserDto): Promise<User> {
    // Validate
    this.validateRegistrationData(data);

    // Check existence
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('User already exists');
    }

    // Create user
    const user = User.create(data);
    const saved = await this.userRepo.save(user);

    // Send welcome email (async, non-blocking)
    this.emailService.sendWelcomeEmail(user.email)
      .catch(err => this.logger.error('Failed to send welcome email', err));

    this.logger.info('User registered', { userId: user.id });
    return saved;
  }

  private validateRegistrationData(data: RegisterUserDto): void {
    if (!validator.isEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }
    if (data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
  }
}
```

## Advanced Error Handling

### Custom Error Hierarchy
```typescript
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

// Global error handler
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Unexpected errors
  logger.error('Unexpected error', { error: err });
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}
```

## Dependency Injection

```typescript
// Container setup
class Container {
  private services = new Map<string, any>();

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }
    return factory();
  }
}

// Registration
const container = new Container();

container.register('database', () => new Database(process.env.DATABASE_URL));
container.register('userRepository', () =>
  new PostgresUserRepository(container.resolve('database'))
);
container.register('emailService', () => new EmailService());
container.register('userService', () =>
  new UserService(
    container.resolve('userRepository'),
    container.resolve('emailService'),
    logger
  )
);

// Usage
const userService = container.resolve<UserService>('userService');
```

## Async Patterns

### Promise.all for Parallel Operations
```typescript
async function getUserDashboard(userId: string): Promise<Dashboard> {
  // Run independent queries in parallel
  const [user, orders, notifications] = await Promise.all([
    userService.getUser(userId),
    orderService.getUserOrders(userId),
    notificationService.getUserNotifications(userId),
  ]);

  return {
    user,
    orders,
    notifications,
  };
}
```

### Retry with Exponential Backoff
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i);
      logger.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms`, { error });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Should never reach here');
}

// Usage
const data = await retryWithBackoff(() =>
  fetch('https://api.example.com/data').then(r => r.json())
);
```

## Testing Patterns

### Test Fixtures and Factories
```typescript
class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      createdAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

// Usage in tests
describe('UserService', () => {
  it('should handle multiple users', () => {
    const users = UserFactory.createMany(5);
    expect(users).toHaveLength(5);
  });
});
```

### Mocking Best Practices
```typescript
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockEmailService = {
      sendWelcomeEmail: jest.fn(),
    } as any;

    userService = new UserService(mockUserRepo, mockEmailService, logger);
  });

  it('should create user and send welcome email', async () => {
    // Arrange
    const userData = { email: 'test@example.com', password: 'Test123!' };
    const savedUser = UserFactory.create(userData);
    mockUserRepo.save.mockResolvedValue(savedUser);

    // Act
    const result = await userService.registerUser(userData);

    // Assert
    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ email: userData.email })
    );
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(userData.email);
    expect(result).toEqual(savedUser);
  });
});
```

## Performance Optimization

### Caching Strategy
```typescript
class CachedUserRepository implements UserRepository {
  constructor(
    private repo: UserRepository,
    private cache: Cache,
    private ttl: number = 300 // 5 minutes
  ) {}

  async findById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;

    // Check cache first
    const cached = await this.cache.get<User>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const user = await this.repo.findById(id);
    if (user) {
      await this.cache.set(cacheKey, user, this.ttl);
    }

    return user;
  }

  async save(user: User): Promise<User> {
    const saved = await this.repo.save(user);

    // Invalidate cache
    await this.cache.delete(`user:${user.id}`);

    return saved;
  }
}
```

### Database Query Optimization
```typescript
// ❌ BAD - N+1 query problem
async function getUsersWithOrders(): Promise<UserWithOrders[]> {
  const users = await db.query('SELECT * FROM users');

  for (const user of users) {
    user.orders = await db.query(
      'SELECT * FROM orders WHERE user_id = $1',
      [user.id]
    );
  }

  return users;
}

// ✅ GOOD - Single query with JOIN
async function getUsersWithOrders(): Promise<UserWithOrders[]> {
  const result = await db.query(`
    SELECT
      u.id, u.email, u.name,
      o.id as order_id, o.total, o.status
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
  `);

  return this.groupByUser(result);
}
```

---

*These patterns should be loaded when complex implementation scenarios require detailed examples.*
