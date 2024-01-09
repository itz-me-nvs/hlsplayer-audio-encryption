import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HlsDemoComponent } from './hls-demo.component';

describe('HlsDemoComponent', () => {
  let component: HlsDemoComponent;
  let fixture: ComponentFixture<HlsDemoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HlsDemoComponent]
    });
    fixture = TestBed.createComponent(HlsDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
