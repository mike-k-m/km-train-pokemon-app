<script setup>
console.log(`cathPokemon Enter`);

const route = useRoute();
const trainerName = route.params.name;

// PokeAPIのURL、現在のURL、前のURL(previousプロパティ)、次のURL(nextプロパティ)
const currentURL = ref("https://pokeapi.co/api/v2/pokemon/"); // 初期値は https://pokeapi.co/api/v2/pokemon/
const nextURL = ref("");
const previousURL = ref("");

const pokemonList = ref([]);  // Pokemonリストは、pokeAPI戻り値の"results"プロパティ。配列
const pokemonCount = ref(0);  // Pokemonカウントは、pokeAPI戻り値の"count"プロパティ。不変の用で、reactiveが不要かも

// 現在のページに表示しているポケモンの数
const currentPageCount = ref(0); 

// 表示済みのpokemonの種類の数。
const countAlreadyShown = ref(0);

// 未表示のpokemonの種類
const countYetToShow = computed( () => {
  return pokemonCount.value - countAlreadyShown.value;
});

// この画面に初回ロード時にPokeAPIをfetchする
// const { data } = await useFetch(`https://pokeapi.co/api/v2/pokemon/?offset=0&limit=9999`); //最初の実装PokeAPIを試すため
const { data: pokeResult, refresh } = await useFetch(currentURL);

// updateValues関数は、pokeAPIのfetchした後、pokeAPI戻り値から各変数に代入する
const updateValues = () => {
  pokemonList.value = pokeResult.value.results;
  pokemonCount.value = pokeResult.value.count;
  nextURL.value = pokeResult.value.next;
  previousURL.value = pokeResult.value.previous;
  currentPageCount.value = pokeResult.value.results.length;
}

updateValues();

// 表示済みのpokemonの種類数は、記憶しなければならない。初回だけここで表示中に値をセットする。
countAlreadyShown.value = currentPageCount.value;

// 「前へ」、「次へ」ボタンでfetchし直すので、fetchしたデータの変化をwatchし、表示データを更新する。
watch(pokeResult, () => {
  updateValues();
});

// 前へのボタンを押せるかを制御するフラグ。nextURLがnull OR "" OR undefinedの時にtrueを返す（無効にすべき）
const disableGoNext = computed( () => {
  if (nextURL.value == "" || nextURL.value == null || nextURL.value == undefined) {
    return true;
  } else {
    return false;
  }
});

// 前へのボタンを押せるかを制御するフラグ。previousURLがnull OR "" OR undefinedの時にtrueを返す（無効にすべき）
const disableGoPrevious = computed( () => {
  if (previousURL.value == "" || previousURL.value == null || previousURL.value == undefined) {
    return true;
  } else {
    return false;
  }
});

// 「捕まえる」ボタンのイベントハンドラ
const onCatch = async (pokemonName) => {
  console.log(`cathPokemon onCatch pokemonName: ${pokemonName}`);
  try {
    await useFetch(`/api/trainer/${trainerName}/pokemon/${pokemonName}`,
                  { 
                    method: 'put',
                    body: JSON.stringify({
                      trainerName: `${trainerName}`,
                      pokemonName: `${pokemonName}`
                    })
                  });
    await navigateTo(`/trainerInfo/${trainerName}`);
  } catch(err) {
    console.log(`catchPokemon 追加エラー`, err);
  }
};

// 「次へ」ボタンのイベントハンドラー
const goNext = async () => {
  // 次のページを遷移する前に、fetchするURL(currentURL)をnextURLに設定する。
  currentURL.value = nextURL.value;

  // fetchする
  await refresh();

  // 次のページに遷移したので、表示済みの種類数を今回Fetchした数を足す。
  countAlreadyShown.value += currentPageCount.value;
}

// 「前へ」ボタンのイベントハンドラー
const goPrevious = async () => {
  // 前のページを遷移する前に、fetchするURL(currentURL)をpreviousURLに設定する。
  currentURL.value = previousURL.value;

  // 前のページ戻る前に、表示済の種類数を、現在の画面に表示中の種類数を減らす。
  countAlreadyShown.value -= currentPageCount.value;

  // fetchする
  await refresh();
}

</script>

<template>
  <div>
    <h1>ポケモンをつかまえる</h1>
    <p>{{ pokemonCount }}種類のポケモン (表示済み：{{ countAlreadyShown }}種類, 未表示：{{ countYetToShow }}種類)</p>
    <p>このページに表示中：{{currentPageCount}}種類</p>
    <GamifyButton @click="navigateTo('/')">はじめの画面へ</GamifyButton>
    <div>
      <GamifyButton :disabled="disableGoPrevious" @click="goPrevious()">前へ</GamifyButton>
      <GamifyButton :disabled="disableGoNext" @click="goNext()">次へ</GamifyButton>
    </div>
    <GamifyList v-for="(pokemon, index) in pokemonList" :key="index">
      <span style="margin-right: 200px;">{{ pokemon.name }}</span>
      <GamifyButton @click="onCatch(pokemon.name)">捕まえる</GamifyButton>
    </GamifyList>
    <div>
      <GamifyButton :disabled="disableGoPrevious" @click="goPrevious()">前へ</GamifyButton>
      <GamifyButton :disabled="disableGoNext" @click="goNext()">次へ</GamifyButton>
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
