<script setup>
console.log(`cathPokemon Enter`);

const route = useRoute();
const trainerName = route.params.name;

// const { data } = await useFetch(`https://pokeapi.co/api/v2/pokemon/`);
const { data } = await useFetch(`https://pokeapi.co/api/v2/pokemon/?offset=0&limit=9999`);
const pokemonList = data.value.results;
const pokemonCount = data.value.count;
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

</script>

<template>
  <div>
    <h1>ポケモンをつかまえる</h1>
    <p>{{ pokemonCount }}種類のポケモン</p>
    <div v-for="(pokemon, index) in pokemonList" :key="index">
        <span>
            <span>{{ pokemon.name }}　</span>
            <button @click="onCatch(pokemon.name)">捕まえる</button>
        </span>
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
