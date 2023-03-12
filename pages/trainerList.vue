<script setup>

// 講師から教えてもらったコード
const trainers = ref([]);
// useFetchの2番目の引数はCacheしない意味。公式ドキュメント https://nuxt.com/docs/api/composables/use-fetch
const trainersObj = await useFetch(`/api/trainers`, {server: false}); 
watchEffect(()=>{
    // console.log(trainersObj.data.value);
    trainers.value = trainersObj.data.value;
})

// 自前のコード。fetchを使う
// onMounted(async () =>{
//     const trainersObj = await fetch('/api/trainers');
//     trainers.value = await trainersObj.json();
//     console.log(trainersObj);
// });

</script>

<template>
  <div>
    <h1>つづきからはじめる</h1>
    <form @submit.prevent>
        <p v-for="(x, index) in trainers" :key="index">
            {{x}}
        </p>
    </form>
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
