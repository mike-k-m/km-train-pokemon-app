import { ListObjectsCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./s3Client";

const config = useRuntimeConfig();

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

/** トレーナーの一覧の取得 */
export const findTrainers = async () => {
  const objects = await s3Client.send(
    new ListObjectsCommand({ Bucket: config.bucketName })
  );
  return objects.Contents ?? [];
};

/** トレーナーの取得 */
// TODO: トレーナーを取得する S3 クライアント処理の実装
export const getTrainer = async(name) => {

  const bucketParams = {
    Bucket: config.bucketName,
    Key: name+".json"
  };
  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(new GetObjectCommand(bucketParams));
    // Convert the ReadableStream to a string.
    return await data.Body.transformToString();
  } catch (err) {
    console.log("Error", err);
  }  
};

/** トレーナーの追加更新 */
export const upsertTrainer = async (name, trainer) => {

  // 確認用
  //console.log(`upsertTrainer() Start ---------`);
  //console.log({ name: name, pokemons: [], ...trainer });
  //console.log(`upsertTrainer() End ---------`);

  const result = await s3Client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: `${name}.json`,
      Body: JSON.stringify({ name: name, pokemons: [], ...trainer }),
    })
  );
  return result;
};

/** トレーナーの削除 */
// TODO: トレーナーを削除する S3 クライアント処理の実装
export const deleteTrainer = async(name) => {

  const bucketParams = {
    Bucket: config.bucketName,
    Key: name+".json"
  };
  try {
    const data = await s3Client.send(new DeleteObjectCommand(bucketParams));
    console.log("Backend Success. トレーナーを削除しました。", data);
    return data;
  } catch (err) {
    console.log("Error", err);
  }  
};

/** ポケモンの削除 */
export const deletePokemon = async(trainerName, pokemonID) => {

  console.log(`deletPokemon() enter ${trainerName}, ${pokemonID}`); 
  const trainerString = await getTrainer(trainerName);
  const trainer = JSON.parse(trainerString)
  console.log(`deletPokemon() before`, trainer); 

  // 指定されたIDのポケモンを削除
  trainer.pokemons = trainer.pokemons.filter( x => (x.id !== Number(pokemonID)));

  console.log(`deletPokemon() -------------------------`); 
  console.log(`deletPokemon() after`, trainer);

  // ポケモンIDを順番に振り直す
  for (let i = 0; i < trainer.pokemons.length; i++) {
    trainer.pokemons[i].id = i+1;
  }
  
  console.log(`deletPokemon() -------------------------`); 
  console.log(`deletPokemon() after renumber`, trainer);

  // トレーナー自体を更新する。
  const ret = await upsertTrainer(trainerName, trainer);
  console.log(ret);
  return ret;
}

/** ポケモンにニックネームをつけられる */
export const giveNickName = async(trainerName, pokemonID, nickName) => {

  console.log(`giveNickName() enter ${trainerName}, ${pokemonID}, ${nickName}`); 

  // トレーナーのデータを取得
  const trainerString = await getTrainer(trainerName);
  const trainer = JSON.parse(trainerString)
  console.log(`giveNickName() before`, trainer); 

  // トレーナーのデータから該当ポケモンを探して、そのポケモンにニックネームを代入する
  trainer.pokemons.map( (x) => {
    if (x.id === Number(pokemonID)) {
      x.nickname = nickName;
    }
  });
  console.log(`giveNickName() -------------------------`); 
  console.log(`giveNickName() after`, trainer);

  // トレーナー自体を更新する。
  const ret = await upsertTrainer(trainerName, trainer);
  console.log(ret);
  return ret;
}