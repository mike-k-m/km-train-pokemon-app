<script setup>
console.log('trainerInfo Enter');

// Dynamic Routeからパラメータを取得する
// 画面のURL http://localhost:3000/trainerInfo/<trainerName>
const route = useRoute();
const trainerName = route.params.name;

// 画面表示最初のとき、トレーナー情報を取得し、ポケモン一覧の作成する
const { data: trainerInfo } = await useFetch(`/api/trainer/${trainerName}`);
console.log(`trainerInfo:`, trainerInfo.value);
const pokemonList = trainerInfo.value.pokemons;

// 「マサラタウンに帰る」ボタンのイベントハンドラー
const deleteTrainer = async () => {
  try {
    const {data} = await useFetch(`/api/trainer/${trainerName}`, 
    {
      method: "delete",
    });
    // const resultCode = data.value["$metadata"].httpStatusCode; // TODO レスポンスの型に問題ある
    console.log(`deleteTrainer useFetch結果: ${data}`);
    await navigateTo(`/`);
  } catch(err) {
    console.log(`deleteTrainer Err`, err);
  }
};

// 「ポケモンを捕まえる」ボタンのイベントハンドラー
const onCatch = async () => {
  await navigateTo(`/trainerInfo/${trainerName}/catchPokemon`);
}

</script>

<template>
  <div>
    <h1>トレーナー情報</h1>
    <div>
      <p>トレーナー名：{{trainerName}}</p>
      <button @click="deleteTrainer">マサラタウンに帰る</button>
    </div>
    <div>
      <h2>てもちポケモン</h2>
      <button @click="onCatch">ポケモンを捕まえる</button>
    </div>
    <div>
      <div v-for="(pokemon, index) in pokemonList" :key="index" style="border: solid blue;">
        <!-- <div v-if="pokemon == true">  -->
          <img :src=pokemon.sprites.front_default alt="">       
          <span>{{ pokemon.nickname ? pokemon.nickname : pokemon.name }}</span>
          <button>ニックネームを付ける（未実装）</button>
          <button>博士に送る（未実装）</button>
        <!-- </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
form {
  border-radius: 0.5rem;
  border: solid 4px #555;
  padding: 1.5rem 3rem;
}

form > :not(:last-child) {
  display: block;
  margin-bottom: 1rem;
}

.item > label,
.item > span {
  display: block;
  margin-bottom: 0.25rem;
}
.item > span {
  font-size: 0.875rem;
}
</style>
