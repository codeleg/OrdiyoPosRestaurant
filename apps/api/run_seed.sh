#!/bin/bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pos_db"
NODE_BIN="/home/usermetin/.vscode-server/bin/b6a47e94e326b5c209d118cf0f994d6065585705/node"
TS_NODE_JS="/home/usermetin/projects/PostRestoran/node_modules/ts-node/dist/bin.js"
TS_CONFIG="/home/usermetin/projects/PostRestoran/apps/api/tsconfig.json"
SEED_SCRIPT="/home/usermetin/projects/PostRestoran/apps/api/prisma/seed.ts"

cd /home/usermetin/projects/PostRestoran/apps/api
$NODE_BIN $TS_NODE_JS -P $TS_CONFIG $SEED_SCRIPT
