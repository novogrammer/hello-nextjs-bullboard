# Hello Next.js Bull-Board

「Next.jsのAppRouterを使ってみる」というのが当初の目的だったが、<br>
Bullを前提としたカスタムサーバーも試すことにした。<br>

## 前提
+ Docker Compose
+ `.env`ファイル

## dev実行
```bash
docker compose -f compose.dev.yaml build
docker compose -f compose.dev.yaml up
```

## prod実行
```bash
docker compose -f compose.prod.yaml build
docker compose -f compose.prod.yaml up
```


## 構築手順メモ
1. `npx create-next-app@latest`
2. `next-app`フォルダへ移動
3. `next.js`の`examples/with-docker-compose`を参考にDocker環境を構築（マルチステージビルドはしない）
4. `compose.*.yaml`にredisを追加
5. `next.js`の`examples/custom-server`を参考にカスタムサーバー対応
6. `express`対応
7. `bull-board`の`examples/with-express`を参考に`bull-board`を導入
