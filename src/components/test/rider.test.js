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
  weight: 100000
};

let onClickStub;

const createTarget = (position = {}, params) => {
  onClickStub = sinon.stub();

  const allParams = Object.assign({
    scale: 1,
    labelRotate: 90
  }, params);

  return shallow(<Rider
    position={Object.assign({}, defaultPosition, position)}
    onClick={onClickStub}
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
    expect(createTarget({ powerOutput: 0 }).hasClass('rider-power-0')).toBe(true);
    expect(createTarget({ powerOutput: 90 }).hasClass('rider-power-0')).toBe(true);
  });

  test('renders class for 1wkg power', () => {
    expect(createTarget({ powerOutput: 110 }).hasClass('rider-power-1')).toBe(true);
  });

  test('renders class for 2wkg power', () => {
    expect(createTarget({ powerOutput: 210 }).hasClass('rider-power-2')).toBe(true);
  });

  test('renders class for 3wkg power', () => {
    expect(createTarget({ powerOutput: 310 }).hasClass('rider-power-3')).toBe(true);
  });

  test('renders class for 4wkg power', () => {
    expect(createTarget({ powerOutput: 410 }).hasClass('rider-power-4')).toBe(true);
  });

  test('renders class for 5wkg power', () => {
    expect(createTarget({ powerOutput: 510 }).hasClass('rider-power-5')).toBe(true);
  });

  test('renders class for 6wkg power', () => {
    expect(createTarget({ powerOutput: 610 }).hasClass('rider-power-6')).toBe(true);
  });

  test('renders class for 7wkg power', () => {
    expect(createTarget({ powerOutput: 710 }).hasClass('rider-power-7')).toBe(true);
  });

  test('renders class for 8wkg power', () => {
    expect(createTarget({ powerOutput: 810 }).hasClass('rider-power-8')).toBe(true);
    expect(createTarget({ powerOutput: 910 }).hasClass('rider-power-8')).toBe(true);
  });
});
