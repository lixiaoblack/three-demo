<!--
 * @Author: wanglx
 * @Date: 2025-04-07 13:29:16
 * @LastEditors: wanglx
 * @LastEditTime: 2025-04-07 15:14:14
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="h-full w-full" @mousemove="onMouseMove">
    <canvas id="canvas" ref="canvasRef" class="h-full w-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import MachineRoom from "./MachineRoom";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const room = ref<MachineRoom | null>(null);

onMounted(() => {
  if (canvasRef.value) {
    room.value = new MachineRoom(canvasRef.value);
    room.value.loadGLTF("machineRoom.gltf");
    room.value.animate();

    // Initialize WebGL context and set up the scene here
    // For example, you can create a simple triangle or cube
  }
});

const onMouseMove = (event: MouseEvent) => {
  if (room.value) {
    const rect = canvasRef.value?.getBoundingClientRect();
    const x = event.clientX - (rect?.left || 0);
    const y = event.clientY - (rect?.top || 0);
    room.value.selectCabinet(x, y);
  }
};

onBeforeUnmount(() => {
  if (room.value) {
    room.value.dispose();
  }
});
</script>

<style scoped></style>
