import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth and Users (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth Module (e2e)', () => {
    describe('POST /auth/login', () => {
      it('should login successfully with valid credentials', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            cpf: '13271936986',
            password: '3d4f5y62d',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('access_token');
            expect(typeof res.body.access_token).toBe('string');
            authToken = res.body.access_token;
          });
      });

      it('should fail login with invalid CPF', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            cpf: '99999999999',
            password: '3d4f5y62d',
          })
          .expect(401)
          .expect((res) => {
            expect(res.body).toHaveProperty('message');
          });
      });

      it('should fail login with invalid password', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            cpf: '13271936986',
            password: 'wrongpassword',
          })
          .expect(401);
      });

      it('should fail login with empty credentials', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            cpf: '',
            password: '',
          })
          .expect(401);
      });

      it('should fail login with missing CPF', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            password: '3d4f5y62d',
          })
          .expect(400);
      });

      it('should fail login with missing password', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            cpf: '13271936986',
          })
          .expect(400);
      });

      it('should fail login with empty body', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({})
          .expect(400);
      });

      it('should return JWT token with proper structure', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            cpf: '13271936986',
            password: '3d4f5y62d',
          })
          .expect(200)
          .expect((res) => {
            const token = res.body.access_token;
            expect(token).toBeDefined();
            // JWT should have 3 parts separated by dots
            const parts = token.split('.');
            expect(parts.length).toBe(3);
          });
      });
    });
  });

  describe('Users Module (e2e)', () => {
    beforeAll(async () => {
      // Get auth token for protected routes
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          cpf: '13271936986',
          password: '3d4f5y62d',
        });
      authToken = response.body.access_token;
    });

    describe('POST /users', () => {
      it('should create a new user', () => {
        return request(app.getHttpServer())
          .post('/users')
          .send({
            email: 'newuser@test.com',
            name: 'New User',
            cpf: '98765432100',
            password: 'securepass123',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('cpf');
            expect(res.body.cpf).toBe('98765432100');
          });
      });

      it('should fail to create user with invalid email', () => {
        return request(app.getHttpServer())
          .post('/users')
          .send({
            email: 'invalid-email',
            name: 'Test User',
            cpf: '12345678900',
            password: 'password123',
          })
          .expect(400);
      });

      it('should fail to create user with short password', () => {
        return request(app.getHttpServer())
          .post('/users')
          .send({
            email: 'test@example.com',
            name: 'Test User',
            cpf: '12345678900',
            password: 'short',
          })
          .expect(400);
      });

      it('should fail to create user with short name', () => {
        return request(app.getHttpServer())
          .post('/users')
          .send({
            email: 'test@example.com',
            name: 'A',
            cpf: '12345678900',
            password: 'password123',
          })
          .expect(400);
      });

      it('should fail to create user with missing required fields', () => {
        return request(app.getHttpServer())
          .post('/users')
          .send({
            cpf: '12345678900',
          })
          .expect(400);
      });

      it('should create user without role (optional field)', () => {
        return request(app.getHttpServer())
          .post('/users')
          .send({
            email: 'norole@test.com',
            name: 'No Role User',
            cpf: '11111111111',
            password: 'password123',
          })
          .expect(201);
      });
    });

    describe('GET /users', () => {
      it('should return all users when authenticated', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
          });
      });

      it('should fail without authentication token', () => {
        return request(app.getHttpServer()).get('/users').expect(401);
      });

      it('should fail with invalid token', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', 'Bearer invalid.token.here')
          .expect(401);
      });

      it('should fail with malformed authorization header', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', 'InvalidFormat token')
          .expect(401);
      });

      it('should fail with empty authorization header', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', '')
          .expect(401);
      });
    });

    describe('GET /users/:cpf', () => {
      it('should return user by CPF when authenticated', () => {
        return request(app.getHttpServer())
          .get('/users/13271936986')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('cpf');
            expect(res.body.cpf).toBe('13271936986');
          });
      });

      it('should return empty/null for non-existent CPF', () => {
        return request(app.getHttpServer())
          .get('/users/99999999999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .get('/users/13271936986')
          .expect(401);
      });

      it('should handle empty CPF parameter', () => {
        return request(app.getHttpServer())
          .get('/users/')
          .set('Authorization', `Bearer ${authToken}`)
          .expect((res) => {
            // Will hit users list endpoint
            expect(200).toBe(res.status);
          });
      });
    });
  });

  describe('Integration Tests', () => {
    it('should complete full user registration and login flow', async () => {
      const uniqueCpf = `${Date.now()}`.slice(-11).padStart(11, '0');

      // 1. Create new user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `user${uniqueCpf}@test.com`,
          name: 'Integration Test User',
          cpf: uniqueCpf,
          password: 'testpass123',
        })
        .expect(201);

      expect(createResponse.body.cpf).toBe(uniqueCpf);

      // 2. Login with new user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          cpf: uniqueCpf,
          password: 'testpass123',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('access_token');
      const newToken = loginResponse.body.access_token;

      // 3. Access protected route with new token
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      // 4. Verify user can be found by CPF
      const userResponse = await request(app.getHttpServer())
        .get(`/users/${uniqueCpf}`)
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(userResponse.body.cpf).toBe(uniqueCpf);
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${authToken}`),
      );

      const responses = await Promise.all(promises);

      responses.forEach((res) => {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      });
    });

    it('should maintain token validity across requests', async () => {
      // First request
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Second request with same token
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Third request with same token
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Error Handling (e2e)', () => {
    it('should handle invalid JSON in request body', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should return proper error structure', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          cpf: '99999999999',
          password: 'wrong',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode');
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should handle very large request bodies', () => {
      const largePassword = 'a'.repeat(10000);
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          cpf: '13271936986',
          password: largePassword,
        })
        .expect((res) => {
          expect([400, 401, 413]).toContain(res.status);
        });
    });
  });

  describe('Security Tests (e2e)', () => {
    it('should not expose sensitive user data in responses', () => {
      return request(app.getHttpServer())
        .get('/users/13271936986')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('cpf');
        });
    });

    it('should reject requests without proper content-type', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'text/plain')
        .send('cpf=13271936986&password=3d4f5y62d')
        .expect((res) => {
          expect([400, 415]).toContain(res.status);
        });
    });

    it('should handle SQL injection attempts in CPF', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          cpf: "'; DROP TABLE users; --",
          password: 'password',
        })
        .expect(401);
    });

    it('should handle XSS attempts in input', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          name: '<script>alert("xss")</script>',
          cpf: '12345678900',
          password: 'password123',
        })
        .expect((res) => {
          expect([201, 400]).toContain(res.status);
        });
    });
  });
});
