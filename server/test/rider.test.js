const sinon = require('sinon');
const Rider = require('../rider');

const riderId = 10101;

let testRider;
let mockAccount;
let mockAllRiders;
let mockEvents;
let mockProfile;
let mockGhosts;
let stubStatusFn;

const meProfile = {
  id: riderId,
  me: true
};
const riding = [
  { playerId: riderId },
  { playerId: 20102 },
  { playerId: 30103 },
  { playerId: 40104 },
  { playerId: 50105 }
];

const testStatusFn = id => ({ id, x: id + 10, z: id + 20 });

const expectPositions = (positions, ids) => {
  expect(positions.map(p => ({id: p.id, x: p.x, y: p.y })))
      .toEqual(ids.map(id => {
        if (isNaN(id)) return id;
        const testStatus = testStatusFn(id);
        return {
          id: testStatus.id,
          x: testStatus.x,
          y: testStatus.z
        };
      }));
}

beforeEach(async () => {
  mockAccount = {};
  mockAllRiders = {
    get: sinon.stub().returns(Promise.resolve(riding))
  };
  mockEvents = {
    findMatchingEvent: sinon.stub(),
    getRiders: sinon.stub(),
    setRidingInEvent: sinon.stub(),
    getRidersInEvent: sinon.stub()
  };
  mockProfile = {
    getProfile: sinon.spy(id => Promise.resolve({ id, me: id === riderId })),
    getFollowees: sinon.stub()
  };
  mockGhosts = {
    getPositions: sinon.stub().returns([])
  };
  stubStatusFn = sinon.spy(id => Promise.resolve(testStatusFn(id)));

  Rider.clearUsers();
  Rider.clearRiders();

  testRider = new Rider(mockAccount, riderId, stubStatusFn);
  await testRider.restorePromise;
  await testRider.setFilter('');
  
  testRider.allRiders = mockAllRiders;
  testRider.events = mockEvents;
  testRider.profile = mockProfile;
  testRider.ghosts = mockGhosts;

  testRider.ridingNowDate = null;
  testRider.ridingNow = null;
});

describe('state', () => {
  test('restores filter for same rider id', async () => {
    await testRider.setFilter('test');

    const newRider = new Rider(mockAccount, riderId, stubStatusFn);
    await newRider.restorePromise;

    expect(newRider.getFilter()).toEqual('test');
  });

  test('doesn\'t restore filter for different rider id', async () => {
    await testRider.setFilter('test');

    const newRider = new Rider(mockAccount, 20102, stubStatusFn);
    await newRider.restorePromise;

    expect(newRider.getFilter()).toBe(undefined);
  });
});

describe('getPositions', () => {
  describe('without filter', () => {
    const friends = [ 20102, 30103, 40104 ];

    beforeEach(() => {
      mockProfile.getFollowees.returns(Promise.resolve(friends));
      mockAllRiders.get.returns(Promise.resolve([riding[0], riding[1], riding[3]]));
    });

    test('gets me and friends who are riding', async () => {
      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId, 20102, 40104]);
    });

    test('includes any current ghosts', async () =>
    {
      const ghosts = [
        { id: 60106, x: 61, y: 62 },
        { id: 70107, x: 71, y: 72 }
      ];
      mockGhosts.getPositions.returns(ghosts);

      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId, 20102, 40104, ghosts[0], ghosts[1]]);
    });

    test('don\'t include me if not riding', async () => {
      mockAllRiders.get.returns(Promise.resolve([riding[1], riding[3]]));

      const positions = await testRider.getPositions();

      expectPositions(positions, [20102, 40104]);
    });
  });

  describe('with name filter', () => {
    const riding = [
      { playerId: riderId, firstName: 'Fred', lastName: 'Bloggs' },
      { playerId: 20102, firstName: 'Smithey', lastName: 'Smoo' },
      { playerId: 30103, firstName: 'Ted', lastName: 'McSmi-thom' },
      { playerId: 40104, lastName: 'McSmithom' }
    ];

    beforeEach(() => {
      testRider.setFilter('smith');
      mockAllRiders.get.returns(Promise.resolve(riding));
    });

    test('gets all name matches and adds me', async () => {

      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId, 20102, 40104]);
    });
  });

  describe('with event id filter', () => {
    const event = {
      eventSubgroups: [
        { id: 91, label: 1},
        { id: 92, label: 2}
      ]
    };
    const subEvent91 = [
      { id: 40104 }
    ];
    const subEvent92 = [
      { id: 30103 },
      { id: 50105 }
    ];

    beforeEach(() => {
      testRider.setFilter('event:913');
      mockEvents.findMatchingEvent.withArgs('913')
          .returns(Promise.resolve(event));

      mockEvents.getRiders.withArgs(91).returns(Promise.resolve(subEvent91));
      mockEvents.getRiders.withArgs(92).returns(Promise.resolve(subEvent92));
    });

    test('gets all name matches and adds me', async () => {
      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId, 40104, 30103, 50105]);
    });

    test('gets all name matches including me and sorts', async () => {
      mockEvents.getRiders.withArgs(92).returns(Promise.resolve([
        { id: 30103 }, { id: riderId }, { id: 50105 }
      ]));

      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId, 30103, 50105, 40104]);
    });

    test('cannot find event', async () => {
      mockEvents.findMatchingEvent.withArgs('913')
            .returns(Promise.resolve(null));

      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId]);
    });

    test('doesn\'t use event name tracker', async () => {
      const positions = await testRider.getPositions();

      expect(mockEvents.setRidingInEvent.called).toBe(false);
      expect(mockEvents.getRidersInEvent.called).toBe(false);
    });
  });

  describe('with event name filter matching official event', () => {
    const event = {
      eventSubgroups: [
        { id: 91, label: 1},
        { id: 92, label: 2}
      ]
    };
    const subEvent91 = [
      { id: 40104 }
    ];
    const subEvent92 = [
      { id: 30103 },
      { id: 50105 }
    ];

    beforeEach(() => {
      testRider.setFilter('event:test');
      mockEvents.findMatchingEvent.withArgs('test')
          .returns(Promise.resolve(event));

      mockEvents.getRiders.withArgs(91).returns(Promise.resolve(subEvent91));
      mockEvents.getRiders.withArgs(92).returns(Promise.resolve(subEvent92));
      mockEvents.getRidersInEvent.returns(Promise.resolve([]));
    });

    test('gets all name matches and adds me', async () => {
      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId, 40104, 30103, 50105]);
    });

    test('gets all name matches including me and sorts', async () => {
      mockEvents.getRiders.withArgs(92).returns(Promise.resolve([
        { id: 30103 }, { id: riderId }, { id: 50105 }
      ]));

      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId, 30103, 50105, 40104]);
    });

    test('cannot find event', async () => {
      mockEvents.findMatchingEvent.withArgs('test')
            .returns(Promise.resolve(null));

      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId]);
    });

    test('adds user to event name tracker', async () => {
      const positions = await testRider.getPositions();

      expect(mockEvents.setRidingInEvent.calledWith('test')).toBe(true);
      expect(mockEvents.getRidersInEvent.called).toBe(false);
    });
  });

  describe('with event name filter without official event', () => {
    const eventRiders = [
      { id: 20102 },
      { id: riderId },
      { id: 40104 }
    ];

    beforeEach(() => {
      testRider.setFilter('event:test');
      mockEvents.findMatchingEvent.withArgs('test')
          .returns(Promise.resolve(null));

      mockEvents.getRidersInEvent.returns(Promise.resolve(eventRiders));
    });

    test('gets players in event and doesn\'t add me twice', async () => {
      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId, 20102, 40104]);
    });

    test('gets other players in event and adds me twice', async () => {
      mockEvents.getRidersInEvent.returns(Promise.resolve([eventRiders[2]]));

      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId, 40104]);
    });

    test('adds user to event name tracker', async () => {
      const positions = await testRider.getPositions();

      expect(mockEvents.setRidingInEvent.calledWith('test')).toBe(true);
    });
  });

  describe('with all:users keyword', () => {
    beforeEach(() => {
      testRider.setFilter('all:users');
    });

    test('gets me as the only player', async () => {
      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId]);
    });

    test('gets any other recent players too', async () => {
      const otherRider = new Rider(mockAccount, 20102, stubStatusFn);
      otherRider.allRiders = mockAllRiders;
      otherRider.events = mockEvents;
      otherRider.ghosts = mockGhosts;

      otherRider.profile = {
        getProfile: sinon.stub().withArgs(riderId)
            .returns(Promise.resolve({ id: 20102 })),
        getFollowees: sinon.stub().returns(Promise.resolve([]))
      };

      mockProfile.getFollowees.returns(Promise.resolve([]));

      const otherPositions = await otherRider.getPositions();

      const positions = await testRider.getPositions();

      expectPositions(positions, [riderId, 20102]);
    });
  });
});
