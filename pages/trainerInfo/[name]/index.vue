<script setup>
// Dynamic Routeからパラメータを取得する
// 画面のURL http://localhost:3000/trainerInfo/<trainerName>
const route = useRoute();
const trainerName = route.params.name;

// 画面表示最初のとき、トレーナー情報を取得し、ポケモン一覧の作成する
const { data: trainerInfo, refresh } = await useFetch(`/api/trainer/${trainerName}`);
// console.log(`trainerInfo:`, trainerInfo.value);

// pokemonListは、このページのリストですので、動的に更新するにはReactiveｓする。
const pokemonList = ref([]);

// useFetchの結果（trainerInfo)が変わる都度、pokemonListを更新する。
watchEffect(() => {
  pokemonList.value = trainerInfo.value.pokemons;
});

// ニックネームを付けるダイアログを表示/非表示を制御するフラグ
const showDialog = ref(false);

// ニックネーム
const nickName = ref("");

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

// ポケモンを削除する。
const deletePokemon = async (pokemonName, pokemonID) => {
  console.log(`deletePokemon name: ${pokemonName}, id: ${pokemonID}`);
  try {
    // router.delete(`/trainer/:trainerName/pokemon/:pokemonName`, 
    const {data} = await useFetch(`/api/trainer/${trainerName}/pokemon/${pokemonID}`, 
    {
      method: "delete",
    });
    console.log(`deletePokemon useFetch結果: ${data}`);
    
    // PokemonListを更新するため、useFetch関数の戻り値のrefresh関数を呼ぶ。
    // https://nuxt.com/docs/api/composables/use-fetch#return-values
    // refresh/execute : a function that can be used to refresh the data returned by the handler function.
    refresh();

    // 以下は間違った実装（考え方間違い）
    // ポケモンを削除した後に、同じページを遷移(reload)する事で、PokemonListが更新される想定だった。
    // しかし、URLが同じなので、遷移しない。
    // また、正しい考え方は、ページ内のリストをReactiveにすればページのreloadが不要。
    // await navigateTo(`/trainerInfo/${trainerName}`);
  } catch (err) {
      console.log(`deletePokemon Err`, err)
  }
}

// ニックネームを付ける
const giveNickName = async (pokemonName, pokemonID) => {

  if (nickName.value === "") {
    console.log(`giveNickName() ニックネームが空文字。基本的にあり得ない。ダイヤログで空文字チェックしたはず。`)
    return;
  } 
  console.log(`giveNickName(): pokemonName:${pokemonName}, pokemonID: ${pokemonID}, nickName: ${nickName.value}`);
  try {
    const {data} = await useFetch(`/api/trainer/${trainerName}/pokemon/${pokemonID}/${nickName.value}`, 
    {
      method: "put",
    });
    console.log(`giveNickName useFetch結果:`, data);
    refresh();
  } catch (err) {
      console.log(`deletePokemon Err`, err)
  }

  // ニックネームを空文字でリセットする。（次回開く時に記録されないため）
  nickName.value = "";

  // ダイヤログを閉じる（非表示する）
  showDialog.value = false;
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
      <GamifyButton @click="deleteTrainer">マサラタウンに帰る</GamifyButton>
    </div>
    <div>
      <h2>てもちポケモン</h2>
      <GamifyButton @click="onCatch">ポケモンを捕まえる</GamifyButton>
    </div>
    <div>
      <GamifyList v-for="(pokemon, index) in pokemonList" :key="index">
        <img :src=pokemon.sprites.front_default alt="">
        <span>{{ pokemon.nickname ? pokemon.nickname : pokemon.name }}</span>
        <!-- クリックしたら「ニックネームを付ける」ダイヤログを表示する -->
        <GamifyButton @click="showDialog = true">ニックネームを付ける</GamifyButton>
        <GamifyButton @click="deletePokemon(pokemon.name, pokemon.id)">博士に送る</GamifyButton>     
        <!-- 「ニックネームを付ける」ダイヤログ -->
        <GamifyDialog v-show="showDialog === true" id="setNickNameDialog" title="ニックネームを付ける" :description="pokemon.name + 'のニックネームは？'">
          <div>
            <input v-model="nickName" type="text" >
          </div>
          <div>
            <!-- キャンセルの時に入力されたnickNameを空文字でリセットする。そうでないと次回開くときに残される -->
            <GamifyButton @click="showDialog = false; nickName=''">キャンセル</GamifyButton>
            <GamifyButton :disabled="nickName.length < 1" @click="giveNickName(pokemon.name, pokemon.id)">決定</GamifyButton>
          </div>
        </GamifyDialog>
      </GamifyList>
    </div>
    <div>
      <GamifyButton @click="navigateTo('/')">はじめの画面へ</GamifyButton>
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
