# Monitoring Endpointu AI - POST /api/ai/modify/:recipeId

## Kluczowe metryki

### Metryki wydajności

1. **Czas odpowiedzi endpointu**
   - Percentyle: p50, p90, p95, p99
   - Alarm: p95 > 2000ms

2. **Czas odpowiedzi API AI**
   - Percentyle: p50, p90, p95, p99
   - Alarm: p95 > 5000ms

3. **Cache hit rate**
   - Wzór: (cache_hits / total_requests) * 100%
   - Cel: > 40%
   - Alarm: < 30%

4. **Wykorzystanie zasobów**
   - CPU, pamięć, dysk, sieć
   - Alarm: CPU > 80%, pamięć > 80%

### Metryki biznesowe

1. **Liczba modyfikacji przepisów**
   - Mierzone dziennie, tygodniowo, miesięcznie
   - Rozbicie na typy diet, np. keto, lowCarb, itd.

2. **Użycie AI per użytkownik**
   - Rozkład: liczba użytkowników, którzy wykorzystali X modyfikacji
   - Trendy: zmiany w czasie

3. **Odrzucenia żądań**
   - Liczba odrzuceń z powodu limitu AI
   - Procent użytkowników, którzy osiągają limit

4. **Efektywność modyfikacji**
   - Średnia redukcja węglowodanów
   - Najczęściej zastępowane składniki

### Metryki błędów

1. **Współczynnik błędów API**
   - Wzór: (failed_requests / total_requests) * 100%
   - Alarm: > 5%

2. **Błędy parsowania odpowiedzi AI**
   - Liczba nieprawidłowych odpowiedzi JSON
   - Alarm: > 2% wszystkich odpowiedzi

3. **Timeout API AI**
   - Liczba przekroczeń limitu czasu
   - Alarm: > 3% wszystkich zapytań

## Dashboards

### Dashboard główny

1. **Przegląd wydajności**
   - Czas odpowiedzi (wykres liniowy)
   - Cache hit rate (wykres liniowy)
   - Liczba żądań (wykres słupkowy)

2. **Metryki AI**
   - Czas odpowiedzi API AI (wykres liniowy)
   - Współczynnik błędów (wykres liniowy)
   - Top 5 wykorzystywanych modyfikacji diet (wykres kołowy)

3. **Użycie cache**
   - Liczba cache hits vs. cache misses (wykres słupkowy)
   - Średni czas przechowywania w cache (wykres liniowy)
   - Rozmiar kolekcji AICache (wykres liniowy)

### Dashboard błędów

1. **Przegląd błędów**
   - Liczba błędów według typu (wykres słupkowy)
   - Współczynnik błędów (wykres liniowy)
   - Top 5 komunikatów błędów (tabela)

2. **Błędy API AI**
   - Powody błędów (wykres kołowy)
   - Czas odpowiedzi vs. współczynnik błędów (wykres punktowy)

## Alerty

1. **Krytyczne alerty**
   - Współczynnik błędów endpointu > 10% (5 min)
   - p95 czas odpowiedzi > 5000ms (5 min)
   - Niedostępność API AI > 2 min

2. **Ważne alerty**
   - Współczynnik błędów endpointu > 5% (10 min)
   - p95 czas odpowiedzi > 2000ms (10 min)
   - Cache hit rate < 30% (30 min)

3. **Alerty informacyjne**
   - Wysoka liczba odrzuceń z powodu limitu AI
   - Niski współczynnik cache hit rate < 40% (24h)
   - Abnormalny wzrost liczby żądań > 200% średniej

## Logi

Ważne zdarzenia do logowania:

1. Wszystkie zapytania do API AI (czas, parametry, status)
2. Cache hits/misses (inputHash, recipeId)
3. Przekroczenia limitu AI (userId, obecny licznik)
4. Błędy parsowania odpowiedzi AI
5. Timeout'y API AI 