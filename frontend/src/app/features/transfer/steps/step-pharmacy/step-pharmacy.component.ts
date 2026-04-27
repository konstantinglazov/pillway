import {
  Component, OnInit, OnDestroy, NgZone,
  ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../../../environments/environment';
import { TransferFormService } from '../../transfer-form.service';

interface PharmacyResult {
  placeId: string;
  name: string;
  address: string;
  distance?: string;
  lat?: number;
  lng?: number;
}

const CHAINS = ['Walmart Pharmacy', 'Rexall Pharmacy', 'Guardian Pharmacy', 'Shoppers Drug Mart'];

@Component({
  selector: 'pw-step-pharmacy',
  standalone: false,
  template: `
    <!-- Green info tip -->
    <div class="tip-banner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 14v-4m0-4h.01"/></svg>
      You can find your pharmacy name and address on your medication label or prescription bottle.
    </div>

    <!-- Search input -->
    <div class="search-field" [class.focused]="searchFocused">
      <label class="search-label">Search for your current pharmacy</label>
      <div class="search-row">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input #searchInput type="text"
          [value]="searchQuery"
          (input)="onInput($event)"
          (focus)="searchFocused = true"
          (blur)="searchFocused = false"
          placeholder="Type address or pharmacy name"
          autocomplete="off"
          aria-label="Search for a pharmacy" />
        @if (searchQuery) {
          <button class="clear-btn" (click)="clearSearch()" aria-label="Clear search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        }
      </div>
    </div>

    <!-- Predictions dropdown -->
    @if (predictions.length > 0 && !selectedResult) {
      <div class="predictions-list">
        @for (p of predictions; track p.place_id) {
          <button class="prediction-item" (click)="selectPrediction(p)">
            <div class="pred-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
            </div>
            <div class="pred-text">
              <div class="pred-main">{{ p.structured_formatting.main_text }}</div>
              <div class="pred-sub">{{ p.structured_formatting.secondary_text }}</div>
            </div>
          </button>
        }
      </div>
    }

    <!-- Filter panel (shown when no predictions) -->
    @if (predictions.length === 0 || selectedResult) {
      <div class="filter-panel">
        <div class="filter-title">You can filter result by any options below</div>

        <!-- Use my location -->
        <button class="location-btn" [class.active]="usingLocation" (click)="onUseLocation()" [disabled]="locationLoading">
          @if (locationLoading) {
            <span class="spinner spinner-dark"></span>
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          }
          {{ usingLocation ? 'Use my location' : 'Show pharmacy near my location' }}
        </button>

        <!-- Chain chips -->
        <div class="chain-chips">
          @for (chain of chains; track chain) {
            <button class="chain-chip" [class.active]="activeChain === chain" (click)="onChainClick(chain)">
              {{ chain }}
            </button>
          }
        </div>

        <!-- Postal code -->
        @if (!showPostal) {
          <button class="postal-link" (click)="showPostal = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Postal code/ City
          </button>
        } @else if (!postalApplied) {
          <div class="postal-input-wrap">
            <label class="postal-input-label">Add postal code or city</label>
            <input type="text" class="postal-input" #postalInput
              placeholder="e.g., M5V 3A8 / Toronto"
              [value]="postalQuery"
              (input)="postalQuery = postalInput.value"
              (keydown.enter)="applyPostal()" />
          </div>
        } @else {
          <div class="postal-applied">
            <span><strong>Postal code/ City: </strong>{{ postalQuery }}</span>
            <button class="postal-edit" (click)="postalApplied = false">Edit</button>
            <button class="postal-clear" (click)="clearPostal()" aria-label="Clear postal code">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        }
      </div>
    }

    <!-- List / Map tabs -->
    <div class="tab-bar">
      <button class="tab" [class.active]="activeTab === 'list'" (click)="setTab('list')">List view</button>
      <button class="tab" [class.active]="activeTab === 'map'"  (click)="setTab('map')">Map view</button>
    </div>

    <!-- ── LIST VIEW ── -->
    @if (activeTab === 'list') {
      @if (results.length > 0) {
        <div class="results-header">SEARCH RESULT: <span>{{ results.length }} result{{ results.length !== 1 ? 's' : '' }}</span></div>
        @for (r of results; track r.placeId) {
          <div class="result-card" [class.selected]="selectedResult?.placeId === r.placeId" (click)="selectResult(r)">
            <div class="result-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
            </div>
            <div class="result-text">
              <div class="result-name">{{ r.name }}</div>
              <div class="result-addr">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ r.address }}
              </div>
            </div>
            @if (r.distance) {
              <div class="result-dist">{{ r.distance }}</div>
            }
          </div>
        }
        @if (results.length >= 5) {
          <button class="show-all-link">Show all results</button>
        }
      } @else if (!searchLoading) {
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
          </div>
          <div class="empty-title">Find your current pharmacy</div>
          <div class="empty-desc">Search by pharmacy name or address, or use filters to narrow down your options</div>
        </div>
      } @else {
        <div class="search-loading">
          <span class="spinner spinner-dark"></span> Searching…
        </div>
      }
    }

    <!-- ── MAP VIEW ── -->
    <div class="map-wrap" [class.hidden]="activeTab !== 'map'">
      @if (mapLoading) {
        <div class="map-skeleton">
          <span class="spinner spinner-dark"></span>
          <p>Loading map…</p>
        </div>
      }
      @if (mapError) {
        <div class="map-error">Map could not be loaded.</div>
      }
      <div #mapContainer class="map-container" aria-label="Pharmacy map"></div>
      @if (activeTab === 'map' && selectedResult) {
        <div class="map-bottom-card">
          <div class="result-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg></div>
          <div class="result-text">
            <div class="result-name">{{ selectedResult.name }}</div>
            <div class="result-addr">{{ selectedResult.address }}</div>
          </div>
          @if (selectedResult.distance) { <div class="result-dist">{{ selectedResult.distance }}</div> }
        </div>
      }
    </div>

    <!-- Bottom actions -->
    <div class="bottom-actions">
      @if (selectedResult) {
        <button class="btn btn-primary btn-lg btn-full" (click)="onContinue()">Continue</button>
      } @else {
        <button class="btn btn-outline btn-lg btn-full" (click)="onCantFind()">I can't find my pharmacy</button>
      }
    </div>
  `,
  styles: [`
    /* ── Tip banner ── */
    .tip-banner {
      display: flex;
      align-items: flex-start;
      gap: .6rem;
      background: var(--success-light);
      border: 1px solid var(--success-border);
      border-radius: 10px;
      padding: .85rem 1rem;
      font-size: .85rem;
      color: #166534;
      line-height: 1.55;
      margin-bottom: 1rem;
      svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: .15rem; color: var(--success); }
    }

    /* ── Search field ── */
    .search-field {
      border: 1.5px solid var(--border);
      border-radius: 10px;
      margin-bottom: .85rem;
      overflow: hidden;
      transition: border-color var(--transition), box-shadow var(--transition);

      &.focused {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(220,65,39,.12);
      }
    }

    .search-label {
      display: block;
      font-size: .72rem;
      font-weight: 600;
      color: var(--primary);
      padding: .55rem .9rem .1rem;
      letter-spacing: .03em;
    }

    .search-row {
      display: flex;
      align-items: center;
      padding: .3rem .9rem .65rem;
      gap: .5rem;
    }

    .search-icon { width: 16px; height: 16px; color: var(--text-muted); flex-shrink: 0; }

    .search-row input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: .95rem;
      font-family: inherit;
      color: var(--text);
      &::placeholder { color: var(--text-placeholder); }
    }

    .clear-btn {
      background: none; border: none; cursor: pointer; padding: 2px;
      color: var(--text-muted); display: flex;
      svg { width: 14px; height: 14px; }
      &:hover { color: var(--text); }
    }

    /* ── Predictions dropdown ── */
    .predictions-list {
      border: 1.5px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: .85rem;
      background: var(--surface);
      box-shadow: var(--shadow-md);
    }

    .prediction-item {
      display: flex;
      align-items: center;
      gap: .75rem;
      width: 100%;
      padding: .8rem 1rem;
      border: none;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      cursor: pointer;
      text-align: left;
      transition: background var(--transition);
      &:last-child { border-bottom: none; }
      &:hover { background: var(--surface-raised); }
    }

    .pred-icon {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: var(--surface-raised);
      border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      svg { width: 16px; height: 16px; color: var(--text-muted); }
    }

    .pred-main { font-size: .9rem; font-weight: 600; color: var(--text); }
    .pred-sub  { font-size: .78rem; color: var(--text-muted); }

    /* ── Filter panel ── */
    .filter-panel {
      border: 1.5px solid var(--border);
      border-radius: 10px;
      padding: .9rem 1rem;
      margin-bottom: .85rem;
      background: var(--surface);
    }

    .filter-title {
      font-size: .82rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: .75rem;
    }

    .location-btn {
      display: flex;
      align-items: center;
      gap: .45rem;
      background: none;
      border: none;
      color: var(--primary);
      font-size: .88rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      margin-bottom: .85rem;
      font-family: inherit;
      svg { width: 15px; height: 15px; flex-shrink: 0; }
      &.active { opacity: .7; }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }

    .chain-chips {
      display: flex;
      flex-wrap: wrap;
      gap: .45rem;
      margin-bottom: .75rem;
    }

    .chain-chip {
      padding: .4rem .85rem;
      border: 1.5px solid var(--border);
      border-radius: 999px;
      background: var(--surface);
      font-size: .82rem;
      font-family: inherit;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition);
      &:hover { border-color: var(--primary-border); background: var(--primary-light); color: var(--primary); }
      &.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); font-weight: 600; }
    }

    .postal-link {
      display: flex;
      align-items: center;
      gap: .35rem;
      background: none;
      border: none;
      color: var(--primary);
      font-size: .85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      font-family: inherit;
      svg { width: 14px; height: 14px; }
    }

    .postal-input-wrap { margin-top: .35rem; }
    .postal-input-label {
      display: block;
      font-size: .72rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: .3rem;
    }
    .postal-input {
      width: 100%;
      padding: .55rem .8rem;
      border: 1.5px solid var(--primary);
      border-radius: 8px;
      font-size: .9rem;
      font-family: inherit;
      color: var(--text);
      background: var(--surface);
      outline: none;
      box-shadow: 0 0 0 3px rgba(220,65,39,.1);
      &::placeholder { color: var(--text-placeholder); }
    }

    .postal-applied {
      display: flex;
      align-items: center;
      gap: .5rem;
      font-size: .85rem;
      color: var(--text);
      strong { font-weight: 600; }
    }
    .postal-edit {
      background: none; border: none; color: var(--primary); font-size: .85rem;
      font-weight: 600; cursor: pointer; font-family: inherit; padding: 0;
    }
    .postal-clear {
      background: none; border: none; cursor: pointer; color: var(--text-muted);
      display: flex; padding: 2px;
      svg { width: 13px; height: 13px; }
    }

    /* ── Tabs ── */
    .tab-bar {
      display: flex;
      border-bottom: 1.5px solid var(--border);
      margin-bottom: .85rem;
    }

    .tab {
      flex: 1;
      padding: .7rem 0;
      border: none;
      background: none;
      font-size: .88rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      font-family: inherit;
      position: relative;
      transition: color var(--transition);

      &.active {
        color: var(--primary);
        &::after {
          content: '';
          position: absolute;
          bottom: -1.5px;
          left: 0; right: 0;
          height: 2px;
          background: var(--primary);
          border-radius: 2px 2px 0 0;
        }
      }
    }

    /* ── Results ── */
    .results-header {
      font-size: .72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .07em;
      color: var(--text-muted);
      margin-bottom: .65rem;
      span { font-weight: 400; }
    }

    .result-card {
      display: flex;
      align-items: center;
      gap: .85rem;
      padding: .85rem 1rem;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      margin-bottom: .5rem;
      cursor: pointer;
      background: var(--surface);
      transition: all var(--transition);

      &:hover { border-color: var(--primary-border); background: var(--primary-light); }
      &.selected { border-color: var(--primary); background: var(--primary-light); }
    }

    .result-icon {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: var(--surface-raised);
      border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      svg { width: 18px; height: 18px; color: var(--text-muted); }
    }

    .result-text { flex: 1; }
    .result-name { font-size: .9rem; font-weight: 600; color: var(--text); margin-bottom: .2rem; }
    .result-addr {
      display: flex; align-items: flex-start; gap: .3rem;
      font-size: .78rem; color: var(--text-muted); line-height: 1.4;
      svg { flex-shrink: 0; margin-top: .15rem; }
    }
    .result-dist { font-size: .8rem; font-weight: 600; color: var(--text-muted); flex-shrink: 0; }

    .show-all-link {
      display: block; width: 100%; text-align: center;
      background: none; border: none; color: var(--text-muted);
      font-size: .85rem; text-decoration: underline; cursor: pointer;
      padding: .5rem; font-family: inherit;
    }

    /* ── Empty state ── */
    .empty-state {
      display: flex; flex-direction: column;
      align-items: center; text-align: center;
      padding: 2.5rem 1rem;
    }

    .empty-icon-wrap {
      width: 68px; height: 68px;
      border-radius: 50%;
      border: 2px dashed var(--border-strong);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1rem;
      svg { width: 30px; height: 30px; color: var(--text-muted); }
    }

    .empty-title { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: .4rem; }
    .empty-desc  { font-size: .85rem; color: var(--text-muted); max-width: 260px; line-height: 1.55; }

    .search-loading {
      display: flex; align-items: center; gap: .6rem;
      color: var(--text-muted); font-size: .9rem;
      padding: 1.5rem;
      justify-content: center;
    }

    /* ── Map ── */
    .map-wrap {
      position: relative;
      height: 300px;
      border-radius: 10px;
      overflow: hidden;
      border: 1.5px solid var(--border);
      margin-bottom: .85rem;
      background: var(--surface-raised);

      &.hidden { display: none; }
    }

    .map-container { width: 100%; height: 100%; }

    .map-skeleton, .map-error {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: .5rem; font-size: .9rem;
      color: var(--text-muted); background: var(--surface-raised);
    }
    .map-error { color: var(--error); }

    .map-bottom-card {
      position: absolute; bottom: .75rem; left: .75rem; right: .75rem;
      background: var(--surface);
      border-radius: 10px;
      padding: .85rem 1rem;
      display: flex; align-items: center; gap: .75rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border);
    }

    /* ── Bottom actions ── */
    .bottom-actions { margin-top: 1.25rem; }
  `],
})
export class StepPharmacyComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput')  searchInputRef!: ElementRef<HTMLInputElement>;

  readonly chains = CHAINS;

  searchQuery     = '';
  searchFocused   = false;
  searchLoading   = false;
  predictions: google.maps.places.AutocompletePrediction[] = [];
  results: PharmacyResult[] = [];
  selectedResult: PharmacyResult | null = null;

  activeTab: 'list' | 'map' = 'list';
  activeChain = '';
  usingLocation   = false;
  locationLoading = false;
  userLocation: google.maps.LatLng | null = null;

  showPostal   = false;
  postalApplied = false;
  postalQuery  = '';

  mapLoading = true;
  mapError   = false;

  private map?: google.maps.Map;
  private autocompleteService?: google.maps.places.AutocompleteService;
  private placesService?: google.maps.places.PlacesService;
  private markers: google.maps.marker.AdvancedMarkerElement[] = [];
  private debounceTimer?: ReturnType<typeof setTimeout>;

  constructor(
    readonly formService: TransferFormService,
    private readonly router: Router,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const ph = this.formService.sourcePharmacyGroup.value as { place_id: string; name: string; formatted_address: string };
    if (ph?.place_id) {
      this.selectedResult = {
        placeId: ph.place_id,
        name: ph.name,
        address: ph.formatted_address,
      };
    }
  }

  ngAfterViewInit(): void { this.initMap(); }
  ngOnDestroy(): void { clearTimeout(this.debounceTimer); }

  onInput(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.selectedResult = null;
    this.results = [];
    this.activeChain = '';

    clearTimeout(this.debounceTimer);
    if (!this.searchQuery.trim()) {
      this.predictions = [];
      return;
    }
    this.debounceTimer = setTimeout(() => this.fetchPredictions(), 300);
  }

  private fetchPredictions(): void {
    if (!this.autocompleteService) return;
    const req: google.maps.places.AutocompletionRequest = {
      input: this.searchQuery,
      types: ['pharmacy', 'drugstore'],
      componentRestrictions: { country: 'ca' },
    };
    if (this.userLocation) {
      req.location = this.userLocation;
      req.radius = 20000;
    }
    this.searchLoading = true;
    this.autocompleteService.getPlacePredictions(req, (preds, status) => {
      this.ngZone.run(() => {
        this.searchLoading = false;
        this.predictions = status === google.maps.places.PlacesServiceStatus.OK && preds ? preds.slice(0, 6) : [];
        this.cdr.detectChanges();
      });
    });
  }

  selectPrediction(p: google.maps.places.AutocompletePrediction): void {
    this.searchQuery = p.structured_formatting.main_text;
    this.predictions = [];
    this.placesService?.getDetails(
      { placeId: p.place_id, fields: ['name', 'formatted_address', 'geometry', 'place_id'] },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const result: PharmacyResult = {
          placeId: place.place_id ?? p.place_id,
          name: place.name ?? p.structured_formatting.main_text,
          address: place.formatted_address ?? p.structured_formatting.secondary_text,
          distance: this.calcDistance(place.geometry.location),
          lat, lng,
        };
        this.ngZone.run(() => {
          this.results = [result];
          this.updateMapMarkers([result]);
          this.selectResult(result);
          this.cdr.detectChanges();
        });
      }
    );
  }

  selectResult(r: PharmacyResult): void {
    this.selectedResult = r;
    if (r.lat !== undefined && r.lng !== undefined) {
      this.ngZone.runOutsideAngular(() => {
        this.map?.panTo({ lat: r.lat!, lng: r.lng! });
        this.map?.setZoom(15);
      });
    }
    this.ngZone.run(() => {
      this.formService.sourcePharmacyGroup.patchValue({
        name: r.name,
        formatted_address: r.address,
        lat: r.lat ?? null,
        lng: r.lng ?? null,
        place_id: r.placeId,
      });
      this.cdr.detectChanges();
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.predictions = [];
    this.results = [];
    this.selectedResult = null;
    this.activeChain = '';
    this.searchInputRef.nativeElement.focus();
    this.clearMarkers();
    this.formService.sourcePharmacyGroup.reset();
  }

  onChainClick(chain: string): void {
    this.activeChain = this.activeChain === chain ? '' : chain;
    this.searchQuery = this.activeChain;
    this.predictions = [];
    this.selectedResult = null;
    if (this.activeChain) {
      this.searchLoading = true;
      this.results = [];
      this.doTextSearch(this.activeChain);
    } else {
      this.results = [];
    }
  }

  onUseLocation(): void {
    if (!navigator.geolocation) return;
    this.locationLoading = true;
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.ngZone.run(() => {
          this.userLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          this.usingLocation = true;
          this.locationLoading = false;
          this.doNearbySearch();
          this.cdr.detectChanges();
        });
      },
      () => {
        this.ngZone.run(() => { this.locationLoading = false; this.cdr.detectChanges(); });
      }
    );
  }

  applyPostal(): void {
    if (!this.postalQuery.trim()) return;
    this.postalApplied = true;
    this.doTextSearch(this.searchQuery || this.postalQuery);
  }

  clearPostal(): void {
    this.postalQuery = '';
    this.postalApplied = false;
    this.showPostal = false;
  }

  setTab(tab: 'list' | 'map'): void {
    this.activeTab = tab;
    if (tab === 'map') {
      setTimeout(() => {
        google.maps.event.trigger(this.map!, 'resize');
        if (this.selectedResult?.lat) {
          this.map?.panTo({ lat: this.selectedResult.lat!, lng: this.selectedResult.lng! });
        }
      }, 50);
    }
  }

  onContinue(): void {
    if (this.formService.getStepValid(1)) this.router.navigate(['/transfer/confirm']);
  }

  onCantFind(): void {
    alert('Please contact us at support@pillway.com for manual assistance.');
  }

  // ── Google Maps ──────────────────────────────────────────────

  private async initMap(): Promise<void> {
    const bail = new Promise<never>((_, reject) => {
      (window as typeof window & { gm_authFailure?(): void }).gm_authFailure = () =>
        reject(new Error('API key rejected'));
      setTimeout(() => reject(new Error('Maps timed out')), 10_000);
    });

    try {
      const loader = new Loader({ apiKey: environment.googleMapsApiKey, version: 'weekly' });
      const mapsLib = await Promise.race([loader.importLibrary('maps'), bail]);
      const { Map } = mapsLib as google.maps.MapsLibrary;
      await Promise.all([
        loader.importLibrary('places'),
        loader.importLibrary('marker'),
      ]);

      this.ngZone.run(() => { this.mapLoading = false; this.cdr.detectChanges(); });

      this.ngZone.runOutsideAngular(() => {
        this.map = new Map(this.mapContainerRef.nativeElement, {
          center: { lat: 43.6532, lng: -79.3832 },
          zoom: 12,
          mapId: 'DEMO_MAP_ID',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        this.autocompleteService = new google.maps.places.AutocompleteService();
        this.placesService = new google.maps.places.PlacesService(this.map);
      });
    } catch {
      this.ngZone.run(() => { this.mapLoading = false; this.mapError = true; this.cdr.detectChanges(); });
    }
  }

  private doTextSearch(query: string): void {
    if (!this.placesService) return;
    const req: google.maps.places.TextSearchRequest = {
      query: `${query} pharmacy`,
      type: 'pharmacy',
      region: 'ca',
    };
    if (this.userLocation) req.location = this.userLocation;
    if (this.postalApplied && this.postalQuery) req.query += ` ${this.postalQuery}`;

    this.placesService.textSearch(req, (places, status) => {
      this.ngZone.run(() => {
        this.searchLoading = false;
        if (status === google.maps.places.PlacesServiceStatus.OK && places) {
          this.results = places.slice(0, 8).map(p => ({
            placeId: p.place_id ?? '',
            name: p.name ?? '',
            address: p.formatted_address ?? '',
            distance: p.geometry?.location ? this.calcDistance(p.geometry.location) : undefined,
            lat: p.geometry?.location?.lat(),
            lng: p.geometry?.location?.lng(),
          }));
          this.updateMapMarkers(this.results);
        } else {
          this.results = [];
        }
        this.cdr.detectChanges();
      });
    });
  }

  private doNearbySearch(): void {
    if (!this.placesService || !this.userLocation) return;
    this.searchLoading = true;
    this.placesService.nearbySearch(
      { location: this.userLocation, radius: 5000, type: 'pharmacy' },
      (places, status) => {
        this.ngZone.run(() => {
          this.searchLoading = false;
          if (status === google.maps.places.PlacesServiceStatus.OK && places) {
            this.results = places.slice(0, 8).map(p => ({
              placeId: p.place_id ?? '',
              name: p.name ?? '',
              address: p.vicinity ?? p.formatted_address ?? '',
              distance: p.geometry?.location ? this.calcDistance(p.geometry.location) : undefined,
              lat: p.geometry?.location?.lat(),
              lng: p.geometry?.location?.lng(),
            }));
            this.updateMapMarkers(this.results);
            if (this.userLocation) {
              this.map?.panTo(this.userLocation);
              this.map?.setZoom(13);
            }
          }
          this.cdr.detectChanges();
        });
      }
    );
  }

  private updateMapMarkers(results: PharmacyResult[]): void {
    this.clearMarkers();
    this.ngZone.runOutsideAngular(() => {
      results.forEach(r => {
        if (r.lat === undefined || r.lng === undefined) return;
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: this.map,
          position: { lat: r.lat!, lng: r.lng! },
          title: r.name,
        });
        marker.addListener('click', () => this.ngZone.run(() => {
          this.selectResult(r);
          this.cdr.detectChanges();
        }));
        this.markers.push(marker);
      });
    });
  }

  private clearMarkers(): void {
    this.markers.forEach(m => { m.map = null; });
    this.markers = [];
  }

  private calcDistance(loc: google.maps.LatLng): string | undefined {
    if (!this.userLocation) return undefined;
    const dist = google.maps.geometry?.spherical.computeDistanceBetween(this.userLocation, loc);
    if (!dist) return undefined;
    return dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(1)} km`;
  }
}
