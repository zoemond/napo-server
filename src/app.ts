import express from 'express';

const app = express();
const PORT = process.env.PORT || 7000;

app.get('/', function (req: express.Request, res: express.Response) {
    res.send('hello world');
});

app.listen(PORT, function () {
    console.log('server listening. Port:' + PORT);
});
