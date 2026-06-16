import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './guards/auth.gaurd';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';



@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    AuthService,
    StorageService,
    AuthGuard
  ]
})
export class CoreModule {
  /**
   * Prevent CoreModule from being imported multiple times
   * This ensures singleton services remain singleton
   */
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in AppModule ONLY.');
    }
  }
}