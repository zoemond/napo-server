# Dev Setup

## db

1. mysql を install(TODO: docker)
2. `db/create_*.sql`を流す
3. 設定ファイルを配置

```sh
echo '{
    "host": "127.0.0.1",
    "user": "", // ローカル環境に合わす
    "password": "", // ローカル環境に合わす
    "database": "napo",
    "waitForConnections": true,
    "connectionLimit": 10,
    "queueLimit": 0
}
' >  db/db-config.json
```

## Server

0. 設定ファイルを配置

```sh
CLIENT_DIR=../napo-client/
CLIENT_DOMAIN=localhost:8080
```

1. `npm i`
2. `npm run build:watch`

- 差分ビルドします。(ビルドのみ)

3. `npm run demon`

- サーバを起動します。監視ファイルに変更があると起動し直します

## 確認

localhost:<port>にアクセス.ok ぽかったら ok

# 本番setup

### インスタンスの設定(GUI)
- ssd 8G, t2-micro(物理コア 1)
- セキュリティグループの 80 ポートを開けます

### インスタンス内での設定

```sh
sudo yum update
sudo yum install git
# mysql
sudo yum install https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
# よくわからないけど mysql のGPG KEY期限切れというやつらしい。
sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
sudo yum install mysql-community-server
sudo  systemctl start mysqld
# 生成されたrootのパスワードを取得
sudo grep 'temporary password' /var/log/mysqld.log
# 取得したパスワードを入力してログイン
mysql -uroot -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'MyNewPass4!';

# mysqlにログインしてデータベース、テーブルを作成します(README参照)
source db/create_*.sql
# serverの db/db-config.jsonにパスワード、ユーザーを書き込みます(README参照)
vi db/db-config.json

# node
sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install nodejs
# 80番ポートでlistenできるように権限を設定します
sudo setcap 'cap_net_bind_service=+ep' /usr/local/bin/node
# ↑これが設定されたことをどうやって確認するればよいのか。ls -lでなにか出るわけでもなく...

```

## local からクライアントビルド済みの dist を送信します

メモリが 1G しかないので、サーバー側でクライアントのビルドができません。(OOM で落ちる)


```
cd path/to/napo-client
npm run build
scp -r dist {server address, ssh configのnameでも可}:~/work

```


