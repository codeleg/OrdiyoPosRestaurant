#!/bin/bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pos_db"
NODE_BIN="/home/usermetin/.vscode-server/bin/b6a47e94e326b5c209d118cf0f994d6065585705/node"
PRISMA_JS="/home/usermetin/projects/PostRestoran/node_modules/prisma/build/index.js"
SCHEMA="/home/usermetin/projects/PostRestoran/apps/api/prisma/schema.prisma"

$NODE_BIN $PRISMA_JS generate --schema $SCHEMA
