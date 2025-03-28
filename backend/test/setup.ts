// test/setup.ts
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('mocked_salt'),
  hash: jest.fn().mockResolvedValue('mocked_hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked_token'),
  verify: jest.fn().mockImplementation(() => ({ userId: 'mockedUserId', role: 'mockedRole' })),
}));

jest.mock('../src/utils/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mocked_token'),
  verifyToken: jest.fn().mockReturnValue({ userId: 'mockedUserId', role: 'mockedRole' }),
}));
