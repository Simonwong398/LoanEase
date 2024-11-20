#!/bin/bash
# 数据库迁移脚本

function create_migration() {
    local name=$1
    local timestamp=$(date +%Y%m%d%H%M%S)
    local filename="src/migrations/${timestamp}_${name}.ts"
    
    cat > $filename << EOL
import { Migration } from 'typeorm';

export class ${name}${timestamp} implements Migration {
    public async up(queryRunner): Promise<void> {
        // TODO: implement migration up
    }

    public async down(queryRunner): Promise<void> {
        // TODO: implement migration down
    }
}
EOL
    
    echo "Created migration: $filename"
}

case "$1" in
    "create")
        create_migration "$2"
        ;;
    "up")
        npm run typeorm migration:run
        ;;
    "down")
        npm run typeorm migration:revert
        ;;
    *)
        echo "Usage: $0 {create|up|down} [migration-name]"
        exit 1
        ;;
esac 