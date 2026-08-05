// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting
} from '@angular/platform-browser/testing';
import { toHaveNoViolations, toHaveLessThanXViolations } from 'jasmine-axe';

// Global stub for IntersectionObserver (not available in ChromeHeadless/JSDOM)
(window as Window & { IntersectionObserver: unknown }).IntersectionObserver =
  class {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '0px';
    readonly thresholds: ReadonlyArray<number> = [0];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  };

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);

// Install jasmine-axe a11y matchers globally so any spec can call
// expect(await axe(html)).toHaveNoViolations() without per-test setup.
beforeEach(() => {
  jasmine.addMatchers(toHaveNoViolations);
  jasmine.addMatchers(toHaveLessThanXViolations);
});
