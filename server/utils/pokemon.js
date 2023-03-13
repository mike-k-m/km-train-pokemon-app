/** ポケモンの取得 */
export const findPokemon = async (name) => {
  console.log("findPokemon() Enter");
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const pokemon = await response.json();
    return pokemon;
  } catch(err) {
    console.log('findPokemon Err', err);
  }
};

/** https://pokeapi.co/api/v2/ へのプロキシー */
export const proxyPokeapi = async () => {
  console.log("proxyPokeapi() Enter");
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/`);
    const apiList = await response.json();
    console.log(apiList);
    return apiList;
  } catch(err) {
    console.log(`proxyPokeapi Err`, err);
  }
};