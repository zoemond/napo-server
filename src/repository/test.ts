import connection from './connection';

function _testQuery() {
    const query = 'SHOW TABLES;';
    connection.execute(query, function (err, rows) {
        console.log(err, rows);
    });
}

export const testQuery = _testQuery;
