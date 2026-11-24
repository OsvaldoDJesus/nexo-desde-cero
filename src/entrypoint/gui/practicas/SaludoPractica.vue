<script setup lang="ts">
// Práctica de la guía 02: ref, evento, computed y v-if en un solo componente.
// No forma parte de Nexo; tiene una ruta pública (/practica/guia-02) solo para verla.
import { ref, computed } from 'vue';

const nombre = ref('Ana');
const nombreEnMayusculas = computed(() => nombre.value.toUpperCase());
const nombreMuyCorto = computed(() => nombre.value.trim().length < 3);

function cambiarAMaria() {
  nombre.value = 'María';
}
</script>

<template>
  <main class="practica">
    <span class="eyebrow">PRÁCTICA · GUÍA 02</span>
    <h1>Hola, {{ nombre }}<span class="heading-dot">.</span></h1>
    <p class="muted">En mayúsculas (computed): <strong>{{ nombreEnMayusculas }}</strong></p>
    <label for="nombre-practica">Nombre</label>
    <input id="nombre-practica" v-model="nombre" autocomplete="off" />
    <p v-if="nombreMuyCorto" class="error" role="alert">El nombre debe tener al menos 3 caracteres.</p>
    <button type="button" class="button primary" @click="cambiarAMaria">Cambiar a María</button>
    <RouterLink to="/login" class="back-link">Volver al inicio de sesión</RouterLink>
  </main>
</template>

<style scoped>
.practica { max-width: 480px; margin: 64px auto; padding: 0 24px; display: grid; gap: 12px; }
</style>
