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

console.log(`next: ${nextURL.value}`);
console.log(`previous: ${previousURL.value}`);

// 前へのボタンを押せるかを制御するフラグ。previousURLが
const canGoNext = computed( () => {
  if (nextURL.value != "" || nextURL.value != null) {
    return true;
  } else {
    return false;
  }
});
const canGoPrevious = computed( () => {
  if (previousURL.value != "" || nextURL.value != null) {
    return true;
  } else {
    return false;
  }
});

// console.log(pokemonList);

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

const goNext = async () => {
  console.log(`goNext() enter`);
  console.log(`goNext() currentURL.value ${currentURL.value}`);
  console.log(`goNext() pokeResult.value.next ${pokeResult.value.next}`);
  console.log(`goNext() pokeResult.value.previous ${pokeResult.value.previous}`);
  console.log(`goNext() pokeResult.value.results[0].name ${pokeResult.value.results[0].name}`);

  currentURL.value = nextURL.value;

  await refresh();
  updateValues();
  console.log(`goNext() ---------------------------------------------------`);
  console.log(`goNext() After refresh()`);
  console.log(`goNext() currentURL.value ${currentURL.value}`);
  console.log(`goNext() pokeResult.value.next ${pokeResult.value.next}`);
  console.log(`goNext() pokeResult.value.previous ${pokeResult.value.previous}`);
  console.log(`goNext() pokeResult.value.results[0].name ${pokeResult.value.results[0].name}`);
}

const goPrevious = async () => {
  console.log(`goNext() enter`);
  console.log(`goNext() currentURL.value ${currentURL.value}`);
  console.log(`goNext() pokeResult.value.next ${pokeResult.value.next}`);
  console.log(`goNext() pokeResult.value.previous ${pokeResult.value.previous}`);
  console.log(`goNext() pokeResult.value.results[0].name ${pokeResult.value.results[0].name}`);

  currentURL.value = previousURL.value;

  await refresh();
  updateValues();
  console.log(`goNext() ---------------------------------------------------`);
  console.log(`goNext() After refresh()`);
  console.log(`goNext() currentURL.value ${currentURL.value}`);
  console.log(`goNext() pokeResult.value.next ${pokeResult.value.next}`);
  console.log(`goNext() pokeResult.value.previous ${pokeResult.value.previous}`);
  console.log(`goNext() pokeResult.value.results[0].name ${pokeResult.value.results[0].name}`);
}

</script>

<template>
  <div>
    <h1>ポケモンをつかまえる</h1>
    <p>{{ pokemonCount }}種類のポケモン</p>
    <div>
      <GamifyButton :disabled="!canGoPrevious" @click="goPrevious()">前へ</GamifyButton>
      <GamifyButton :disabled="!canGoNext" @click="goNext()">次へ</GamifyButton>
    </div>
    <GamifyList v-for="(pokemon, index) in pokemonList" :key="index">
      <span>{{ pokemon.name }}　</span>
      <GamifyButton @click="onCatch(pokemon.name)">捕まえる</GamifyButton>
    </GamifyList>
    <div>
      <GamifyButton>前へ</GamifyButton>
      <GamifyButton>次へ</GamifyButton>
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
