import { Router } from "express";
import { findTrainers, upsertTrainer } from "~/server/utils/trainer";
import { findPokemon } from "~/server/utils/pokemon";

const router = Router();

router.get("/hello", (_req, res) => {
  res.send("Hello World");
});

/** トレーナー名が既に登録されているかの確認 */
async function doesTrainerExist(inputName) {
  const trainers = await findTrainers();
    const names = trainers.map( trainer => trainer.Key).map( name => name.replace('.json',''));
    if (names.includes(inputName)){
      console.log(`inputトレーナー名: ${inputName}`);
      console.log(`登録されているトレーナー名: ${names}`);
      return true;
    }
    return false;
}

/** トレーナー名の一覧の取得 */
router.get("/trainers", async (_req, res, next) => {
  try {
    const trainers = await findTrainers();
    // TODO: 期待するレスポンスボディに変更する
    // console.log(trainers);
    const names = trainers.map( trainer => trainer.Key).map( name => name.replace('.json',''));
    // const names = [].map( trainer => trainer.Key).map( name => name.replace('.json','')); // テスト用 
    res.send(names);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの追加 */
router.post("/trainer", async (req, res, next) => {
  try {
    // TODO: リクエストボディにトレーナー名が含まれていなければ400を返す
    if (req.body.name === "")
    {
      console.log(`req.body.nameが不正 req.body.name: ${req.body.name}`);
      res.status(400).send("トレーナー名が含まれていない");
    }
    // TODO: すでにトレーナー（S3 オブジェクト）が存在していれば409を返す
    if (doesTrainerExist(req.body.name)){
      res.status(409).send("すでにトレーナーが存在する");
    }

    const result = await upsertTrainer(req.body.name, req.body);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの取得 */
// TODO: トレーナーを取得する API エンドポイントの実装

/** トレーナーの更新 */
router.post("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    // TODO: トレーナーが存在していなければ404を返す
    const result = await upsertTrainer(trainerName, req.body);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの削除 */
// TODO: トレーナーを削除する API エンドポイントの実装

/** ポケモンの追加 */
router.put(
  "/trainer/:trainerName/pokemon/:pokemonName",
  async (req, res, next) => {
    try {
      const { trainerName, pokemonName } = req.params;
      const pokemon = await findPokemon(pokemonName);
      // TODO: 削除系 API エンドポイントを利用しないかぎりポケモンは保持する
      const result = await upsertTrainer(trainerName, { pokemons: [pokemon] });
      res.status(result["$metadata"].httpStatusCode).send(result);
    } catch (err) {
      next(err);
    }
  }
);

/** ポケモンの削除 */
// TODO: ポケモンを削除する API エンドポイントの実装

export default router;
