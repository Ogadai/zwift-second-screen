import React from 'react';
import { shallow } from 'enzyme';
import * as sinon from 'sinon';

import Rider from '../../components/rider.jsx';
import RiderLabel from '../../components/rider-label.jsx';

const defaultPosition = {
  x: 100,
  y: 200,
  firstName: 'Fred',
  lastName: 'Bloggs',
  wattsPerKG: 2.4
};

let onClickStub;
let onRideOnStub;

const createTarget = (position = {}, params) => {
  onClickStub = sinon.stub();
  onRideOnStub = sinon.stub();

  const allParams = Object.assign({
    scale: 1,
    labelRotate: 90
  }, params);

  return shallow(<Rider
    position={Object.assign({}, defaultPosition, position)}
    onClick={onClickStub}
    onRideOn={onRideOnStub}
    {...allParams}
  />);
}

test('shows rider at (x,y) position', () => {
  const wrapper = createTarget();

  expect(wrapper.prop('transform')).toEqual('translate(100,200)');
  expect(wrapper.find('circle').prop('r')).toEqual(6000);
  expect(wrapper.find('.rider-name-text').text()).toEqual('F Bloggs');
  expect(wrapper.find('.rider-name-text').prop('transform')).toEqual('scale(1)');
});

test('scales rider and text', () => {
  const wrapper = createTarget({}, { scale: 2 });

  expect(wrapper.find('circle').prop('r')).toEqual(3000);
  expect(wrapper.find('.rider-name-text').prop('transform')).toEqual('scale(0.5)');
});

test('doesn\'t render rider label', () => {
  const wrapper = createTarget();
  expect(wrapper.find(RiderLabel).length).toBe(0);
});

test('click triggers onClick event', () => {
  const wrapper = createTarget();
  wrapper.find('.rider-icon').simulate('click');

  expect(onClickStub.called).toBe(true);
});

describe('power', () => {
  test('renders class for zero power', () => {
    expect(createTarget({ wattsPerKG: 0 }).hasClass('rider-power-0')).toBe(true);
    expect(createTarget({ wattsPerKG: 0.9 }).hasClass('rider-power-0')).toBe(true);
  });

  test('renders class for 1wkg power', () => {
    expect(createTarget({ wattsPerKG: 1.1 }).hasClass('rider-power-1')).toBe(true);
  });

  test('renders class for 2wkg power', () => {
    expect(createTarget({ wattsPerKG: 2.1 }).hasClass('rider-power-2')).toBe(true);
  });

  test('renders class for 3wkg power', () => {
    expect(createTarget({ wattsPerKG: 3.1 }).hasClass('rider-power-3')).toBe(true);
  });

  test('renders class for 4wkg power', () => {
    expect(createTarget({ wattsPerKG: 4.1 }).hasClass('rider-power-4')).toBe(true);
  });

  test('renders class for 5wkg power', () => {
    expect(createTarget({ wattsPerKG: 5.1 }).hasClass('rider-power-5')).toBe(true);
  });

  test('renders class for 6wkg power', () => {
    expect(createTarget({ wattsPerKG: 6.1 }).hasClass('rider-power-6')).toBe(true);
  });

  test('renders class for 7wkg power', () => {
    expect(createTarget({ wattsPerKG: 7.1 }).hasClass('rider-power-7')).toBe(true);
  });

  test('renders class for 8wkg power', () => {
    expect(createTarget({ wattsPerKG: 8.1 }).hasClass('rider-power-8')).toBe(true);
    expect(createTarget({ wattsPerKG: 9.1 }).hasClass('rider-power-8')).toBe(true);
  });
});

describe('selected', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = createTarget({}, { selected: true });
  });

  test('renders rider label', () => {
    expect(wrapper.find(RiderLabel).length).toBe(1);
    expect(wrapper.find(RiderLabel).prop('sentRideOn')).toBe(false);
  });

  test('click rideon triggers onRideOn event', () => {
    wrapper.find(RiderLabel).prop('onRideOn')();
    expect(onRideOnStub.called).toBe(true);
  });
});
