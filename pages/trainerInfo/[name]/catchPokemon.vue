<script setup>
console.log(`cathPokemon Enter`);

const route = useRoute();
const trainerName = route.params.name;

// PokeAPIのURL、現在のURL、前のURL(previousプロパティ)、次のURL(nextプロパティ)
const currentURL = ref("https://pokeapi.co/api/v2/pokemon/"); // 初期値は https://pokeapi.co/api/v2/pokemon/
const nextURL = ref("");
const previousURL = ref("");

const pokemonList = ref([]);  // Pokemonリストは、pokeAPI戻り値の"results"プロパティ。配列
const pokemonCount = ref(0);

// この画面に初回ロード時にPokeAPIをfetchする
// const { data } = await useFetch(`https://pokeapi.co/api/v2/pokemon/?offset=0&limit=9999`);
const { data: pokeResult, refresh } = await useFetch(currentURL);

// updateValues関数は、pokeAPIのfetchした後、pokeAPI戻り値から各変数に代入する
const updateValues = () => {
  pokemonList.value = pokeResult.value.results;
  pokemonCount.value = pokeResult.value.count;
  nextURL.value = pokeResult.value.next;
  previousURL.value = pokeResult.value.previous;
}

updateValues();

console.log(`初回 currentURL -> ${currentURL.value}`);
console.log(`初回 previousURL -> ${previousURL.value}`);
console.log(`初回 nextURL -> ${nextURL.value}`);

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
    const {data} = await useFetch(`/api/trainer/${trainerName}/pokemon/${pokemonName}`,
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

// 「次へ」ボタンのイベントハンドラー、currentURLを前回に取得したnextURLを代入し、再度fetchする。
const goNext = async () => {
  // console.log(`goNext() enter`);
  // console.log(`goNext() currentURL.value ${currentURL.value}`);
  // console.log(`goNext() pokeResult.value.next ${pokeResult.value.next}`);
  // console.log(`goNext() pokeResult.value.previous ${pokeResult.value.previous}`);
  // console.log(`goNext() pokeResult.value.results[0].name ${pokeResult.value.results[0].name}`);

  currentURL.value = nextURL.value;

  await refresh();
  // console.log(`goNext() ---------------------------------------------------`);
  // console.log(`goNext() After refresh()`);
  console.log(`goNext() currentURL.value ${currentURL.value}`);
  // console.log(`goNext() pokeResult.value.next ${pokeResult.value.next}`);
  // console.log(`goNext() pokeResult.value.previous ${pokeResult.value.previous}`);
  // console.log(`goNext() pokeResult.value.results[0].name ${pokeResult.value.results[0].name}`);
}

// 「前へ」ボタンのイベントハンドラー、currentURLを前回に取得したnextURLを代入し、再度fetchする。
const goPrevious = async () => {
  // console.log(`goPrevious() enter`);
  // console.log(`goPrevious() currentURL.value ${currentURL.value}`);
  // console.log(`goPrevious() pokeResult.value.next ${pokeResult.value.next}`);
  // console.log(`goPrevious() pokeResult.value.previous ${pokeResult.value.previous}`);
  // console.log(`goPrevious() pokeResult.value.results[0].name ${pokeResult.value.results[0].name}`);

  currentURL.value = previousURL.value;

  await refresh();
  // console.log(`goPrevious() ---------------------------------------------------`);
  // console.log(`goPrevious() After refresh()`);
  console.log(`goPrevious() currentURL.value ${currentURL.value}`);
  // console.log(`goPrevious() pokeResult.value.next ${pokeResult.value.next}`);
  // console.log(`goPrevious() pokeResult.value.previous ${pokeResult.value.previous}`);
  // console.log(`goPrevious() pokeResult.value.results[0].name ${pokeResult.value.results[0].name}`);
}

</script>

<template>
  <div>
    <h1>ポケモンをつかまえる</h1>
    <p>{{ pokemonCount }}種類のポケモン</p>
    <div>
      <GamifyButton :disabled="disableGoPrevious" @click="goPrevious()">前へ</GamifyButton>
      <GamifyButton :disabled="disableGoNext" @click="goNext()">次へ</GamifyButton>
    </div>
    <GamifyList v-for="(pokemon, index) in pokemonList" :key="index">
      <span>{{ pokemon.name }}　</span>
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
