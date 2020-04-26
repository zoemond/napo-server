import express from 'express';
import path from 'path';
import { testQuery } from '@/repository/test';

const app = express();
const PORT = process.env.PORT || 7000;

app.get('/', function (req: express.Request, res: express.Response) {
    res.sendFile(path.resolve('index.html'));
});
app.get('/db', function (req: express.Request, res: express.Response) {
    testQuery()
    res.status(200).send('ok')
});
app.listen(PORT, function () {
    console.log('server listening. Port:' + PORT);
});
