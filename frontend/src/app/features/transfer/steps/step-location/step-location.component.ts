import { Component, OnInit, OnDestroy, NgZone, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../../../environments/environment';
import { TransferFormService } from '../../transfer-form.service';

@Component({
  selector: 'pw-step-location',
  template: `
    <h2 class="step-heading">Choose a Pharmacy</h2>
    <p class="step-subheading">Search for a nearby pharmacy and select it on the map.</p>

    <!-- Search -->
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input
        #searchInput
        type="text"
        placeholder="Search pharmacy name or address…"
        class="search-input"
        autocomplete="off"
      />
    </div>

    <!-- Map -->
    <div #mapContainer class="map-container" aria-label="Pharmacy map"></div>

    <!-- Selected pharmacy -->
    <div *ngIf="selectedPharmacy" class="pharmacy-card">
      <div class="pharmacy-pin">📍</div>
      <div class="pharmacy-info">
        <strong>{{ selectedPharmacy.name }}</strong>
        <span>{{ selectedPharmacy.formatted_address }}</span>
      </div>
      <div class="pharmacy-check">✓</div>
    </div>

    <div *ngIf="!selectedPharmacy" class="map-hint">
      <span>👆</span> Use the search box above to find and pin a pharmacy
    </div>

    <div class="step-actions">
      <button type="button" class="btn btn-secondary" (click)="onBack()">← Back</button>
      <button type="button" class="btn btn-primary btn-lg"
        [disabled]="!formService.getStepValid(2)"
        (click)="onNext()">
        Next: Review Order →
      </button>
    </div>
  `,
  styles: [`
    .search-wrapper {
      position: relative;
      margin-bottom: 1rem;
    }

    .search-icon {
      position: absolute;
      left: .85rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: .7rem .9rem .7rem 2.5rem;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: .95rem;
      font-family: inherit;
      color: var(--text);
      outline: none;
      transition: border-color var(--transition), box-shadow var(--transition);

      &:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(37,99,235,.12);
      }
    }

    .map-container {
      width: 100%;
      height: 340px;
      border-radius: 10px;
      border: 1.5px solid var(--border);
      margin-bottom: 1rem;
      background: #e8eef4;
      overflow: hidden;
    }

    .pharmacy-card {
      display: flex;
      align-items: center;
      gap: .85rem;
      padding: .9rem 1.1rem;
      background: var(--success-light);
      border: 1.5px solid var(--success-border);
      border-radius: 10px;
      margin-bottom: .5rem;
    }

    .pharmacy-pin { font-size: 1.4rem; flex-shrink: 0; }

    .pharmacy-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: .15rem;

      strong { font-size: .95rem; color: var(--text); }
      span   { font-size: .82rem; color: var(--text-muted); }
    }

    .pharmacy-check {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: var(--success);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .85rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .map-hint {
      font-size: .875rem;
      color: var(--text-muted);
      margin-bottom: .5rem;
      padding: .6rem .9rem;
      background: #f8fafc;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      gap: .4rem;
    }
  `],
})
export class StepLocationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput')  searchInputRef!: ElementRef<HTMLInputElement>;

  selectedPharmacy: { name: string; formatted_address: string } | null = null;

  private map?: google.maps.Map;
  private autocomplete?: google.maps.places.Autocomplete;
  private marker?: google.maps.Marker;

  constructor(
    readonly formService: TransferFormService,
    private readonly router: Router,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const p = this.formService.pharmacyGroup.value as { name: string; formatted_address: string; place_id: string };
    if (p?.place_id) this.selectedPharmacy = { name: p.name, formatted_address: p.formatted_address };
  }

  ngAfterViewInit(): void { this.initMap(); }
  ngOnDestroy(): void {}

  private async initMap(): Promise<void> {
    try {
      await new Loader({ apiKey: environment.googleMapsApiKey, version: 'weekly', libraries: ['places'] }).load();

      this.map = new google.maps.Map(this.mapContainerRef.nativeElement, {
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
        /**
         * NgZone.run() re-enters Angular's zone so that change detection fires
         * immediately after the Maps callback updates component state.
         */
        this.ngZone.run(() => this.onPlaceChanged());
      });
    } catch (err) {
      console.error('Google Maps failed to load:', err);
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
    if (this.marker) { this.marker.setPosition(position); }
    else {
      this.marker = new google.maps.Marker({ map: this.map, position, animation: google.maps.Animation.DROP });
    }
    this.map?.panTo(position);
    this.map?.setZoom(15);
  }

  onBack(): void { this.router.navigate(['/transfer/preferences']); }
  onNext(): void { if (this.formService.getStepValid(2)) this.router.navigate(['/transfer/review']); }
}
