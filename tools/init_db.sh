TOPDIR=$(cd $(dirname $0)/../; pwd)
SQLPATH=$TOPDIR/docker/psql/initdb.d/create_tables/create_tables.sql

heroku pg:psql -a napo-server < $SQLPATH
