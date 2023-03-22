<script setup>

const trainerName = ref("");

// エラーダイアログを表示/非表示を制御するフラグ
const showDialog = ref(false);

// エラーダイアログに表示するメッセージ
const dialogMsg = ref("");

const addTrainer = async() => {

  if (trainerName.value === ""){
    dialogMsg.value = `名前を入力してから、けっていボタンを押してください。`;
    showDialog.value = true;
    return;
  }

  let resultCode = 200;
  try {
    await useFetch(`/api/trainer`, 
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: trainerName.value }),

      // useFetchのレスポンスステータス取得にInterceptorsを使う
      // https://nuxt.com/docs/api/composables/use-fetch#example
      onResponse( { response }) { 
        console.debug(`トレーナーの追加 API response status: ${response.status}`);
        resultCode = response.status;
      }
    });

    switch(resultCode){
      case 200:
        // alert(`${trainerName.value}を登録しました！`);
        // DONE　トレーナー情報画面に遷移する。
        await navigateTo(`/trainerInfo/${trainerName.value}`);
        break;
      case 409:
        dialogMsg.value = `${trainerName.value}はすでにトレーナーが存在します。別の名前で始めてください。`;
        showDialog.value = true;
        break;
      case 400:
        dialogMsg.value = `トレーナー名を入力してないです。`;
        showDialog.value = true;
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
    <p>では　はじめに　きみの　なまえを　おしえて　もらおう！</p>
    <form @submit.prevent>
      <p>なまえ</p>
      <p>とくていの　もじは　とりのぞかれるぞ！</p>
      <input v-model="trainerName" type="text" >
      <GamifyButton @click="addTrainer">けってい</GamifyButton>
    </form>
    <GamifyDialog v-show="showDialog === true" id="1" title="かくにん" :description="dialogMsg">
      <GamifyButton @click="showDialog = false">OK</GamifyButton>
    </GamifyDialog>
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
