module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.schema.ts',
    '!src/rooms/infrastructure/adapters/typeorm-room-repository.adapter.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
};
