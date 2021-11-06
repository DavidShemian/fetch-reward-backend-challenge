import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Connection } from 'typeorm';
import AppModule from '../src/app.module';

describe('Points (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());

        connection = moduleFixture.get<Connection>(Connection);

        await app.init();
    });

    // Clear DB after each test
    afterEach(async () => {
        await connection.synchronize(true);
    });

    it('Should success inserting valid transaction, spending points and return the balance', async () => {
        const transactions = [
            { payer: 'DANNON', points: 300, timestamp: '2020-10-31T10:00:00Z' },
            { payer: 'UNILEVER', points: 200, timestamp: '2020-10-31T11:00:00Z' },
            { payer: 'DANNON', points: -200, timestamp: '2020-10-31T15:00:00Z' },
            { payer: 'MILLER COORS', points: 10000, timestamp: '2020-11-01T14:00:00Z' },
            { payer: 'DANNON', points: 1000, timestamp: '2020-11-02T14:00:00Z' },
        ];

        // Insert the transactions
        for (const transaction of transactions) {
            await request(app.getHttpServer()).post('/transactions').send(transaction).expect(201);
        }

        // Spend the points
        await request(app.getHttpServer())
            .post('/points/spend')
            .send({ points: 5000 })
            .expect(201)
            .expect({
                message: 'Successfully spent points',
                data: [
                    { payer: 'DANNON', points: -100 },
                    { payer: 'UNILEVER', points: -200 },
                    { payer: 'MILLER COORS', points: -4700 },
                ],
            });

        // Get updated balance
        await request(app.getHttpServer())
            .get('/points')
            .expect(200)
            .expect({
                message: 'Successfully got payers points balance',
                data: {
                    DANNON: 1000,
                    UNILEVER: 0,
                    'MILLER COORS': 5300,
                },
            });
    });

    it('Should success spending older points first', async () => {
        const transactions = [
            { payer: 'DANNON', points: 500, timestamp: '2010-10-31T10:00:00Z' },
            { payer: 'UNILEVER', points: 500, timestamp: '2011-10-31T11:00:00Z' },
        ];

        // Insert the transactions
        for (const transaction of transactions) {
            await request(app.getHttpServer()).post('/transactions').send(transaction).expect(201);
        }

        // Get balance
        await request(app.getHttpServer())
            .get('/points')
            .expect(200)
            .expect({
                message: 'Successfully got payers points balance',
                data: {
                    DANNON: 500,
                    UNILEVER: 500,
                },
            });

        // Spend the points
        await request(app.getHttpServer())
            .post('/points/spend')
            .send({ points: 600 })
            .expect(201)
            .expect({
                message: 'Successfully spent points',
                data: [
                    { payer: 'DANNON', points: -500 },
                    { payer: 'UNILEVER', points: -100 },
                ],
            });

        // Get balance
        await request(app.getHttpServer())
            .get('/points')
            .expect(200)
            .expect({
                message: 'Successfully got payers points balance',
                data: {
                    DANNON: 0,
                    UNILEVER: 400,
                },
            });
    });

    it('Should fail when transaction points is not an integer', async () => {
        await request(app.getHttpServer())
            .post('/transactions')
            .send({ payer: 'DANNON', points: 300.3, timestamp: '2020-10-31T10:00:00Z' })
            .expect(400)
            .expect({
                statusCode: 400,
                message: ['points must be an integer number'],
                error: 'Bad Request',
            });
    });

    it('Should fail when trying to spend negative points', async () => {
        await request(app.getHttpServer())
            .post('/points/spend')
            .send({ points: -100 })
            .expect(400)
            .expect({
                statusCode: 400,
                message: ['points must be a positive number'],
                error: 'Bad Request',
            });

        await request(app.getHttpServer())
            .post('/points/spend')
            .send({ points: '-100' })
            .expect(400)
            .expect({
                statusCode: 400,
                message: ['points must be a positive number', 'points must be an integer number'],
                error: 'Bad Request',
            });
    });

    it('Should fail when trying to spend too much points', async () => {
        await request(app.getHttpServer())
            .post('/transactions')
            .send({ payer: 'DANNON', points: 200, timestamp: '2020-08-02T14:00:00Z' })
            .expect(201);

        await request(app.getHttpServer())
            .post('/points/spend')
            .send({ points: 100 })
            .expect(201)
            .expect({
                message: 'Successfully spent points',
                data: [{ payer: 'DANNON', points: -100 }],
            });

        await request(app.getHttpServer()).post('/points/spend').send({ points: 150 }).expect(400);

        await request(app.getHttpServer())
            .get('/points')
            .expect(200)
            .expect({
                message: 'Successfully got payers points balance',
                data: {
                    DANNON: 100,
                },
            });
    });

    it('Should fail to insert negative transaction which results in negative payer points', async () => {
        await request(app.getHttpServer())
            .post('/transactions')
            .send({ payer: 'DANNON', points: 1000, timestamp: '2020-11-02T14:00:00Z' })
            .expect(201);

        await request(app.getHttpServer())
            .post('/transactions')
            .send({ payer: 'UNILEVER', points: 200, timestamp: '2020-10-31T11:00:00Z' })
            .expect(201);

        // Previous DANNON transaction had an earlier timestamp than this transaction
        // Therefore, when reducing the 200 points in this transaction, we don't have a sufficient amount of points
        // and a negative amount of points error should be thrown
        await request(app.getHttpServer())
            .post('/transactions')
            .send({ payer: 'DANNON', points: -200, timestamp: '2020-10-31T15:00:00Z' })
            .expect(400);
    });

    it('Should fail to insert negative transaction which results in negative payer points 2', async () => {
        await request(app.getHttpServer())
            .post('/transactions')
            .send({ payer: 'DANNON', points: 200, timestamp: '2020-08-02T14:00:00Z' })
            .expect(201);

        await request(app.getHttpServer())
            .post('/transactions')
            .send({ payer: 'UNILEVER', points: 200, timestamp: '2020-10-31T11:00:00Z' })
            .expect(201);

        // Previous DANNON transaction was for 200 points
        // Trying to reduce 300 points should fail
        await request(app.getHttpServer())
            .post('/transactions')
            .send({ payer: 'DANNON', points: -300, timestamp: '2020-10-31T15:00:00Z' })
            .expect(400);
    });

    it('Should fail when transaction has an invalid date', async () => {
        await request(app.getHttpServer())
            .post('/transactions')
            .send({ payer: 'DANNON', points: 200, timestamp: '2020-13-02T14:00:00Z' })
            .expect(400)
            .expect({
                statusCode: 400,
                message: ['timestamp must be a valid ISO 8601 date string'],
                error: 'Bad Request',
            });

        await request(app.getHttpServer())
            .post('/transactions')
            .send({ payer: 'DANNON', points: 200, timestamp: '2020' })
            .expect(400)
            .expect({
                statusCode: 400,
                message: ['timestamp must be a valid ISO 8601 date string'],
                error: 'Bad Request',
            });
    });

    it('Should fail when trying to reduce points from new payer', async () => {
        await request(app.getHttpServer())
            .post('/transactions')
            .send({ payer: 'DANNON', points: -10, timestamp: '2020-10-02T14:00:00Z' })
            .expect(400)
            .expect({
                statusCode: 400,
                message: 'Unable to reduce points from new payer',
                error: 'Bad Request',
            });
    });
});
