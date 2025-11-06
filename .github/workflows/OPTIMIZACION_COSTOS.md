# 💰 Optimización de Costos - GitHub Actions

## 📊 Estado Actual
- **Plan**: GitHub Free (2,000 min/mes)
- **Runners**: ubuntu-latest (1x multiplicador)
- **Artifacts**: Retención 7 días (auto-limpieza)
- **Costo estimado**: $0 USD/mes ✅

---

## 🎯 Optimizaciones Aplicables

### 1. **Reducir Ejecuciones Redundantes**
Si tienes múltiples workflows que hacen lo mismo, considera consolidar:

```yaml
# ❌ ANTES: 5 workflows diferentes
- ci-cd-simple.yml (build + deploy en main)
- firebase-hosting-merge.yml (deploy en main)  # DUPLICADO
- pr-validation.yml (validación en PR)
- firebase-hosting-pull-request.yml (preview en PR)  # DUPLICADO
- release.yml (release con tags)

# ✅ DESPUÉS: 3 workflows consolidados
- main.yml (CI/CD para main branch)
- pr.yml (Validación y preview para PRs)
- release.yml (Release automation)
```

### 2. **Cancelar Workflows Redundantes**
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true  # Cancela runs anteriores si hay un nuevo push
```

### 3. **Limitar Triggers**
```yaml
# Solo ejecutar en cambios relevantes
on:
  push:
    branches: [main]
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.gitignore'
```

### 4. **Cachear Agresivamente**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # ✅ Ya lo tienes

- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
```

### 5. **Skip CI en Commits Menores**
Agregar `[skip ci]` en el mensaje de commit:
```bash
git commit -m "docs: update README [skip ci]"
```

---

## 🚨 Workflows Duplicados Detectados

### **DUPLICACIÓN 1**: Deploy en Main Branch
- `ci-cd-simple.yml`: Hace build + deploy a Firebase
- `firebase-hosting-merge.yml`: Hace build + deploy a Firebase

**Solución**: Eliminar uno de los dos (recomiendo mantener `ci-cd-simple.yml` que tiene más features)

### **DUPLICACIÓN 2**: Preview en PRs
- `pr-validation.yml`: Hace build + preview + análisis
- `firebase-hosting-pull-request.yml`: Hace build + preview

**Solución**: Eliminar `firebase-hosting-pull-request.yml`, ya que `pr-validation.yml` es más completo

---

## 📋 Plan de Acción Recomendado

### Opción A: **Consolidación Mínima** (Recomendado)
1. ✅ Mantener `ci-cd-simple.yml` para main branch
2. ✅ Mantener `pr-validation.yml` para PRs
3. ✅ Mantener `release.yml` para releases
4. ❌ **ELIMINAR** `firebase-hosting-merge.yml` (duplicado)
5. ❌ **ELIMINAR** `firebase-hosting-pull-request.yml` (duplicado)

**Beneficio**: Reduce ~40% de ejecuciones redundantes

### Opción B: **Sin Cambios** (Seguro)
- Mantener todo como está
- Sigue siendo **GRATIS** con plan GitHub Free
- Solo vigilar que no excedas 2,000 min/mes

---

## 📊 Cómo Monitorear Uso

### En GitHub
```
Repo → Settings → Billing → Usage this month
```

### Artifacts Storage
```
Repo → Actions → Management → Storage
```

### Minutos por Workflow
```
Repo → Actions → Seleccionar un run → Ver duración
```

---

## 🎯 Conclusión

**NO necesitas preocuparte por costos** porque:
1. ✅ Plan Free de GitHub cubre tu uso
2. ✅ Usas runners Linux (1x, no premium)
3. ✅ Artifacts se autolimpian en 7 días
4. ✅ Firebase Hosting es gratuito para tu nivel de uso

**Única mejora recomendada**: Eliminar workflows duplicados para mantener todo más limpio y simple.
