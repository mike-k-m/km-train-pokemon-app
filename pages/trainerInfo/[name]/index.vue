<script setup>
console.log('trainerInfo Enter');

const deleteTrainer = async () => {
  try {
    const {data} = await useFetch(`/api/trainer/${$route.params.name}`, 
    {
      method: "delete",
    });
    const resultCode = data.value["$metadata"].httpStatusCode;
    console.log(`deleteTrainer useFetch結果: ${resultCode}`);
    await navigateTo(`/`);
  } catch(err) {
    console.log(`deleteTrainer Err`, err);
  }
};

</script>

<template>
  <div>
    <h1>トレーナー情報</h1>
    <div>
      <p>トレーナー名：{{$route.params.name}}</p>
      <button @click="deleteTrainer">マサラタウンに帰る</button>
    </div>
    <div>
      <h2>てもちポケモン</h2>
      <button>ポケモンを捕まえる</button>
    </div>
    <div>
      <!-- TODO ポケモンリスト -->
      <p>ポケモンリスト</p>
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
