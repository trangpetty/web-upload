<template>
  <router-view></router-view>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;700&display=swap');

:root {
  --yellow: #FCD006;
  --red: #AC0101;
  --text-color: #D11C0E;
  --light-red: #FFEDEB;
}

body {
  font-family: 'Be Vietnam Pro', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/images/bg.png');
  background-size: contain;
  background-position: top center;
  background-repeat: no-repeat;
  background-color: var(--red);
}

.h-100 {
    height: 100%;
}
</style>
