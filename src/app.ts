import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 7000;

app.get('/', function (req: express.Request, res: express.Response) {
    res.sendFile(path.resolve('index.html'));
});

app.listen(PORT, function () {
    console.log('server listening. Port:' + PORT);
});
