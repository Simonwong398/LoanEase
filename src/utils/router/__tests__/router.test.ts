import { jest } from '@jest/globals';
import { routerManager, Route } from '../index';

type MiddlewareFunction = (to: Route, from: Route | null) => Promise<boolean> | boolean;

describe('RouterManager', () => {
  const mockRoutes: Route[] = [
    {
      path: '/home',
      name: 'home',
      component: () => null,
    },
    {
      path: '/users',
      name: 'users',
      component: () => null,
      children: [
        {
          path: '/:id',
          name: 'user-detail',
          component: () => null,
        },
      ],
    },
  ];

  beforeEach(() => {
    routerManager.dispose();
    routerManager.registerRoutes(mockRoutes);
  });

  it('should register routes correctly', () => {
    expect(routerManager.getCurrentRoute()).toBeNull();
    expect(routerManager.getState().stack).toHaveLength(0);
  });

  it('should navigate to route', async () => {
    const result = await routerManager.navigate('/home');
    expect(result).toBe(true);
    expect(routerManager.getCurrentRoute()?.path).toBe('/home');
  });

  it('should handle params in navigation', async () => {
    const result = await routerManager.navigate('/users/:id', { id: 1 });
    expect(result).toBe(true);
    expect(routerManager.getState().params).toEqual({ id: 1 });
  });

  it('should handle middleware', async () => {
    const middleware = jest.fn<MiddlewareFunction>().mockImplementation(
      () => Promise.resolve(true)
    );
    
    routerManager.use(middleware as MiddlewareFunction);
    await routerManager.navigate('/home');
    expect(routerManager.getState().currentRoute?.path).toBe('/home');
  });
}); 