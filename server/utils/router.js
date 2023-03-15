import { Router } from "express";
import { findTrainers, upsertTrainer, getTrainer, deleteTrainer, deletePokemon } from "~/server/utils/trainer";
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
    if (await doesTrainerExist(req.body.name)){
      res.status(409).send("すでにトレーナーが存在する");
    }

    const result = await upsertTrainer(req.body.name, req.body);
    console.log(`trainer API result:`, result);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの取得 */
// TODO: トレーナーを取得する API エンドポイントの実装
router.get("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    
    if (await doesTrainerExist(trainerName) == false){     
      res.status(404).send("トレーナーが存在しない");
    } else {
      const trainerData = await getTrainer(trainerName);
      // console.log(trainerData); //デバッグ用
      res.status(200).send(JSON.parse(trainerData));
    }
  } catch (err) {
    next(err);
  }
});

/** トレーナーの更新 */
router.post("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    // TODO: トレーナーが存在していなければ404を返す
    console.log(`POST ${trainerName}`)
    if (await doesTrainerExist(trainerName) == false){     
      res.status(404).send("トレーナーが存在しない");
    } else {
      const result = await upsertTrainer(trainerName, req.body);
      res.status(result["$metadata"].httpStatusCode).send(result);
    }
  } catch (err) {
    next(err);
  }
});

/** トレーナーの削除 */
// TODO: トレーナーを削除する API エンドポイントの実装
router.delete("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    // TODO: トレーナーが存在していなければ404を返す
    console.log(`DELETE ${trainerName}`)
    if (await doesTrainerExist(trainerName) == false){     
      res.status(404).send("トレーナーが存在しない");
    } else {
      const result = await deleteTrainer(trainerName, req.body);
      res.status(result["$metadata"].httpStatusCode).send(result);
    }
  } catch (err) {
    next(err);
  }
});

/** ポケモンの追加 */
router.put(
  "/trainer/:trainerName/pokemon/:pokemonName",
  async (req, res, next) => {
    try {
      const { trainerName, pokemonName } = req.params;
      console.log(`ポケモンの追加 trainerName: ${trainerName} pokemonName: ${pokemonName}`);
      const pokemon = await findPokemon(pokemonName);
      // console.log(`------------`, pokemon);
      // TODO: 削除系 API エンドポイントを利用しないかぎりポケモンは保持する

      const trainerData = await getTrainer(trainerName);        // トレーナーが現在持っているポケモンのリスト。戻り値はJSON文字列
      const trainerPokemons = JSON.parse(trainerData).pokemons; // JSON文字列からオブジェクトに変換し、中のポケモン配列を抽出
      //  console.log(`-----!!!!!既存トレーナーのポケモン配列-------`, trainerPokemons);
       // 新しいポケモンオブジェクトを作る
      const newPokemon = {
        id: trainerPokemons.length + 1, // idは既存トレーナーのポケモン配列プラス１
        nickname: "",
        order: pokemon.order,
        name: pokemon.name,
        sprites:{
          front_default: pokemon.sprites.front_default,
        }
      }

      // 新しいポケモンオブジェクトを、既存トレーナーのポケモン配列に追加する
      trainerPokemons.push(newPokemon);
      // console.log(`-----?????追加後のトレーナのポケモン配列-------`, trainerPokemons);

      const result = await upsertTrainer(trainerName, { pokemons: trainerPokemons });
      // const result = await upsertTrainer(trainerName, { pokemons: [pokemon] }); //オリジナル
      res.status(result["$metadata"].httpStatusCode).send(result);
    } catch (err) {
      next(err);
    }
  }
);

/** ポケモンの削除 */
// TODO: ポケモンを削除する API エンドポイントの実装
router.delete(`/trainer/:trainerName/pokemon/:pokemonID`, 
async (req, res, next) => {
  try {
    const { trainerName, pokemonID } = req.params;
    console.log(`DELETE ${trainerName}, ${pokemonID}`);
    const result = await deletePokemon(trainerName, pokemonID);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

export default router;
