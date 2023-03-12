<script setup>

const trainerName = ref("");

const addTrainer = async() => {

  if (trainerName.value === ""){
    alert("名前を入力してから、けっていボタンを押してください。");
    return;
  }

  try {
    const {data} = await useFetch(`/api/trainer`, 
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: trainerName.value })
    });
    const resultCode = data.value["$metadata"].httpStatusCode;
    console.log(`addTrainer useFetch結果: ${resultCode}`);

    switch(resultCode){
      case 200:
        alert(`${trainerName.value}を登録しました！`);
        // TODO　トレーナー情報画面に遷移する。
        break;
      case 409:
        alert(`${trainerName.value}はすでにトレーナーが存在します`);
        break;
      case 400:
        alert(`トレーナー名を入力してないです。`);
        break;
      default:
        console.log(`addTrainer useFetchは不明なresponseが帰ってきた${resultCode}`);
    }
  } catch (err) {
    console.error(`addTrainer userFetch Error`, err);
  }
};

</script>

<template>
  <div>
    <h1>あたらしくはじめる</h1>
    <form @submit.prevent>
      <p>なまえ</p>
      <p>とくていの　もじは　とりのぞかれるぞ！</p>
      <input v-model="trainerName" type="text" >
      <button @click="addTrainer">けってい</button>
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
