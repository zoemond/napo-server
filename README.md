# Dev Setup
## db
1. mysqlをinstall(TODO: docker)
2. `db/*.sql`を流す
3. 設定ファイルを配置
```sh
echo '{
    "host": "127.0.0.1",
    "user": "", // ローカル環境に合わす
    "password": "", // ローカル環境に合わす
    "database": "napo"
}' >  db/db-config.json
```
## Server
1. `npm i`
2. `npm run build:watch`
  - 差分ビルドします。(ビルドのみ)
3. `npm run demon`
  - サーバを起動します。監視ファイルに変更があると起動し直します

## 確認
localhost:<port>にアクセス.okぽかったらok
