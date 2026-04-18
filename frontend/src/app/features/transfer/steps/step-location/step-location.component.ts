import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../../../environments/environment';
import { TransferFormService } from '../../transfer-form.service';

/**
 * Step 2 — Pharmacy Location (Google Maps).
 *
 * Loads the Google Maps JavaScript API dynamically and wires a Places
 * Autocomplete widget to the search input.  The selected pharmacy's details
 * are patched into TransferFormService's pharmacy FormGroup so they survive
 * navigation between steps.
 */
@Component({
  selector: 'pw-step-location',
  template: `
    <h2 class="step-heading">Step 2 — Choose a Pharmacy</h2>

    <!-- Autocomplete search input -->
    <div class="form-group">
      <label for="pharmacySearch">Search for a pharmacy</label>
      <input
        #searchInput
        id="pharmacySearch"
        type="text"
        placeholder="Type a pharmacy name or address…"
        class="search-input"
        autocomplete="off"
      />
    </div>

    <!-- Map canvas -->
    <div #mapContainer class="map-container" aria-label="Pharmacy map"></div>

    <!-- Selected pharmacy summary -->
    <div *ngIf="selectedPharmacy" class="pharmacy-summary">
      <strong>{{ selectedPharmacy.name }}</strong>
      <span>{{ selectedPharmacy.formatted_address }}</span>
    </div>

    <div *ngIf="!selectedPharmacy" class="hint-text">
      Search for a pharmacy above to pin it on the map.
    </div>

    <!-- Navigation -->
    <div class="step-actions">
      <button type="button" class="btn btn-secondary" (click)="onBack()">
        Back
      </button>
      <button
        type="button"
        class="btn btn-primary"
        [disabled]="!formService.getStepValid(2)"
        (click)="onNext()"
      >
        Next: Review Order
      </button>
    </div>
  `,
  styles: [`
    .step-heading {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #1a1a2e;
    }

    .search-input {
      width: 100%;
      padding: 0.6rem 0.9rem;
      border: 1px solid #ced4da;
      border-radius: 8px;
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: #0d6efd;
        box-shadow: 0 0 0 3px rgba(13,110,253,0.15);
      }
    }

    .map-container {
      width: 100%;
      height: 380px;
      border-radius: 10px;
      border: 1px solid #dee2e6;
      margin-bottom: 1rem;
      background: #e8eaf0;
    }

    .pharmacy-summary {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      padding: 0.85rem 1rem;
      background: #e8f0fe;
      border: 1px solid #bcd0f7;
      border-radius: 8px;
      margin-bottom: 1rem;

      strong { font-size: 1rem; color: #1a1a2e; }
      span   { font-size: 0.9rem; color: #495057; }
    }

    .hint-text {
      font-size: 0.9rem;
      color: #6c757d;
      margin-bottom: 1rem;
      font-style: italic;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
      gap: 0.75rem;
    }
  `],
})
export class StepLocationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

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
    // Pre-fill summary if the user already selected a pharmacy in a prior visit.
    const pharmacy = this.formService.pharmacyGroup.value as {
      name: string;
      formatted_address: string;
      lat: number | null;
      lng: number | null;
      place_id: string;
    };
    if (pharmacy?.place_id) {
      this.selectedPharmacy = {
        name: pharmacy.name,
        formatted_address: pharmacy.formatted_address,
      };
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    // Google Maps listeners are cleaned up when the map element is removed from
    // the DOM — no explicit removeListener call needed for the Autocomplete.
  }

  /**
   * Loads the Google Maps JS API (including the Places library) dynamically
   * and initialises the map + Autocomplete widget.
   */
  private async initMap(): Promise<void> {
    const loader = new Loader({
      apiKey: environment.googleMapsApiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    try {
      await loader.load();

      const defaultCenter: google.maps.LatLngLiteral = { lat: 43.6532, lng: -79.3832 }; // Toronto

      this.map = new google.maps.Map(this.mapContainerRef.nativeElement, {
        center: defaultCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      this.autocomplete = new google.maps.places.Autocomplete(
        this.searchInputRef.nativeElement,
        {
          types: ['pharmacy'],
          componentRestrictions: { country: 'ca' }, // Restrict to Canada
          fields: ['name', 'formatted_address', 'geometry', 'place_id'],
        }
      );

      this.autocomplete.addListener('place_changed', () => {
        /**
         * WHY NgZone.run():
         * The Google Maps Autocomplete callback executes outside Angular's
         * zone.  Without NgZone.run(), Angular's change detection does not
         * trigger, so template bindings (selectedPharmacy, form validity) would
         * not update until the next external event.  Wrapping the callback
         * re-enters the Angular zone and triggers immediate change detection.
         */
        this.ngZone.run(() => this.onPlaceChanged());
      });
    } catch (err) {
      console.error('Failed to load Google Maps:', err);
    }
  }

  /** Handles a new place selection from the Autocomplete widget. */
  private onPlaceChanged(): void {
    const place = this.autocomplete?.getPlace();

    if (!place?.geometry?.location || !place.place_id) {
      return; // User typed but didn't select a suggestion
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const name = place.name ?? '';
    const formatted_address = place.formatted_address ?? '';

    // Patch the pharmacy FormGroup so TransferFormService reflects the selection.
    this.formService.pharmacyGroup.patchValue({
      name,
      formatted_address,
      lat,
      lng,
      place_id: place.place_id,
    });

    // Update the visual summary below the map.
    this.selectedPharmacy = { name, formatted_address };

    // Drop / move marker and pan map to the selected location.
    const position: google.maps.LatLngLiteral = { lat, lng };

    if (this.marker) {
      this.marker.setPosition(position);
    } else {
      this.marker = new google.maps.Marker({
        map: this.map,
        position,
        animation: google.maps.Animation.DROP,
      });
    }

    this.map?.panTo(position);
    this.map?.setZoom(15);
  }

  onBack(): void {
    this.router.navigate(['/transfer/preferences']);
  }

  onNext(): void {
    if (this.formService.getStepValid(2)) {
      this.router.navigate(['/transfer/review']);
    }
  }
}
