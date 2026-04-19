import { Component, OnInit, OnDestroy, NgZone, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../../../environments/environment';
import { TransferFormService } from '../../transfer-form.service';

@Component({
  selector: 'pw-step-location',
  standalone: false,
  template: `
    <h2 class="step-heading">Choose a Pharmacy</h2>
    <p class="step-subheading">Search for a pharmacy near you and confirm the selection.</p>

    <!-- Search bar -->
    <div class="search-wrap">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input #searchInput type="text" class="search-input"
        placeholder="Search pharmacy name or address…"
        autocomplete="off" aria-label="Search for a pharmacy" />
    </div>

    <!-- Map -->
    <div class="map-wrap">
      @if (mapLoading) {
        <div class="map-skeleton">
          <svg class="map-skeleton-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159-.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0Z"/></svg>
          <p>Loading map…</p>
        </div>
      }
      @if (mapError) {
        <div class="map-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Map failed — check API key restrictions &amp; enabled APIs in Cloud Console.
        </div>
      }
      <div #mapContainer class="map-container" [class.map-hidden]="mapLoading || mapError"
        aria-label="Pharmacy map"></div>
    </div>

    <!-- Selected pharmacy -->
    @if (selectedPharmacy) {
      <div class="pharmacy-card">
        <svg class="pharmacy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
        <div class="pharmacy-info">
          <strong>{{ selectedPharmacy.name }}</strong>
          <span>{{ selectedPharmacy.formatted_address }}</span>
        </div>
        <div class="pharmacy-badge">Selected</div>
      </div>
    } @else {
      <div class="map-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        Use the search box to find and select a pharmacy
      </div>
    }

    <div class="step-actions">
      <button type="button" class="btn btn-secondary" (click)="onBack()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
        Back
      </button>
      <button type="button" class="btn btn-primary btn-lg" [disabled]="!formService.getStepValid(2)" (click)="onNext()">
        Next: Review Order
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
      </button>
    </div>
  `,
  styles: [`
    .search-wrap {
      position: relative;
      margin-bottom: .85rem;
    }

    .search-icon {
      position: absolute;
      left: .85rem;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: var(--text-muted);
      pointer-events: none;
      flex-shrink: 0;
    }

    .search-input {
      width: 100%;
      padding: .7rem .9rem .7rem 2.6rem;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: .95rem;
      font-family: inherit;
      color: var(--text);
      outline: none;
      transition: border-color var(--transition), box-shadow var(--transition);
      background: var(--surface);

      &:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(37,99,235,.12);
      }
    }

    /* ── Map ── */
    .map-wrap {
      position: relative;
      height: 320px;
      border-radius: 10px;
      overflow: hidden;
      border: 1.5px solid var(--border);
      margin-bottom: .85rem;
      background: var(--bg-sunken);
    }

    .map-container {
      width: 100%;
      height: 100%;
      &.map-hidden { visibility: hidden; }
    }

    .map-skeleton, .map-error {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      font-size: .9rem;
      color: var(--text-muted);
      background: var(--surface-raised);
    }

    .map-skeleton-icon { width: 2rem; height: 2rem; animation: pulse 2s ease-in-out infinite; }
    .map-error { color: var(--error); background: var(--error-light); flex-direction: row; gap: .4rem; font-weight: 500; }

    /* ── Selected pharmacy ── */
    .pharmacy-card {
      display: flex;
      align-items: center;
      gap: .85rem;
      padding: .9rem 1.1rem;
      background: var(--success-light);
      border: 1.5px solid var(--success-border);
      border-radius: 10px;
      margin-bottom: .5rem;
      animation: scaleIn .2s ease;
    }

    .pharmacy-icon { width: 1.3rem; height: 1.3rem; flex-shrink: 0; color: var(--success); }

    .pharmacy-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: .12rem;
      strong { font-size: .92rem; color: var(--text); }
      span   { font-size: .8rem;  color: var(--text-muted); }
    }

    .pharmacy-badge {
      font-size: .72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: var(--success);
      background: var(--success-border);
      padding: .25rem .65rem;
      border-radius: 999px;
      flex-shrink: 0;
    }

    .map-hint {
      display: flex;
      align-items: center;
      gap: .45rem;
      font-size: .875rem;
      color: var(--text-muted);
      padding: .65rem .9rem;
      background: var(--surface-raised);
      border-radius: var(--radius-sm);
      border: 1px dashed var(--border);
      margin-bottom: .5rem;
    }
  `],
})
export class StepLocationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput')  searchInputRef!: ElementRef<HTMLInputElement>;

  selectedPharmacy: { name: string; formatted_address: string } | null = null;
  mapLoading = true;
  mapError   = false;

  private map?: google.maps.Map;
  private autocomplete?: google.maps.places.Autocomplete;
  // eslint-disable-next-line deprecation/deprecation
  private marker?: google.maps.Marker;

  constructor(
    readonly formService: TransferFormService,
    private readonly router: Router,
    private readonly ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    const p = this.formService.pharmacyGroup.value as { name: string; formatted_address: string; place_id: string };
    if (p?.place_id) this.selectedPharmacy = { name: p.name, formatted_address: p.formatted_address };
  }

  ngAfterViewInit(): void { this.initMap(); }
  ngOnDestroy(): void {}

  private async initMap(): Promise<void> {
    console.log('[Maps] init — key present:', !!environment.googleMapsApiKey, 'key prefix:', environment.googleMapsApiKey.slice(0, 8));

    // gm_authFailure fires instead of rejecting the importLibrary promise on key/billing errors.
    // The timeout catches every other failure mode (network down, CSP, etc).
    const bail = new Promise<never>((_, reject) => {
      (window as typeof window & { gm_authFailure?(): void }).gm_authFailure = () => {
        console.error('[Maps] gm_authFailure — key rejected by Google');
        reject(new Error('API key rejected — check key restrictions & enabled APIs in Cloud Console'));
      };
      setTimeout(() => {
        console.error('[Maps] load timeout — script never resolved');
        reject(new Error('Google Maps timed out. Check network tab for a failed maps.googleapis.com request.'));
      }, 10_000);
    });

    try {
      console.log('[Maps] calling importLibrary("maps")…');
      const loader = new Loader({ apiKey: environment.googleMapsApiKey, version: 'weekly' });
      const mapsLib = await Promise.race([loader.importLibrary('maps'), bail]);
      console.log('[Maps] maps library loaded, loading places…');
      const { Map } = mapsLib as google.maps.MapsLibrary;
      await loader.importLibrary('places');
      console.log('[Maps] places library loaded');

      this.ngZone.run(() => { this.mapLoading = false; });
      // One tick lets Angular remove .map-hidden from the DOM so Google Maps
      // measures the correct container size and renders tiles on first load.
      await new Promise<void>(resolve => setTimeout(resolve, 0));

      this.map = new Map(this.mapContainerRef.nativeElement, {
        center: { lat: 43.6532, lng: -79.3832 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
      });

      this.autocomplete = new google.maps.places.Autocomplete(this.searchInputRef.nativeElement, {
        types: ['pharmacy'],
        componentRestrictions: { country: 'ca' },
        fields: ['name', 'formatted_address', 'geometry', 'place_id'],
      });

      this.autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => this.onPlaceChanged());
      });
    } catch (err) {
      console.error('[Maps]', err);
      this.ngZone.run(() => { this.mapLoading = false; this.mapError = true; });
    }
  }

  private onPlaceChanged(): void {
    const place = this.autocomplete?.getPlace();
    if (!place?.geometry?.location || !place.place_id) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const name = place.name ?? '';
    const formatted_address = place.formatted_address ?? '';

    this.formService.pharmacyGroup.patchValue({ name, formatted_address, lat, lng, place_id: place.place_id });
    this.selectedPharmacy = { name, formatted_address };

    const position = { lat, lng };
    if (this.marker) {
      this.marker.setPosition(position);
    } else {
      // eslint-disable-next-line deprecation/deprecation
      this.marker = new google.maps.Marker({ map: this.map, position, animation: google.maps.Animation.DROP });
    }
    this.map?.panTo(position);
    this.map?.setZoom(15);
  }

  onBack(): void { this.router.navigate(['/transfer/preferences']); }
  onNext(): void { if (this.formService.getStepValid(2)) this.router.navigate(['/transfer/review']); }
}
