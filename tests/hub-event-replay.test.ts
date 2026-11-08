import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shouldReplayHubLead} from '../server/hub-event-replay.ts';

test('default sweeper parks disabled historical leads but retries pending',()=>{
  assert.equal(shouldReplayHubLead({id:2,hubEventStatus:'disabled'},''),false);
  assert.equal(shouldReplayHubLead({id:2,hubEventStatus:'pending'},''),true);
});
test('selected lead 2 can replay with the original event; all other IDs stay parked',()=>{
  for(const state of ['pending','disabled']) {
    assert.equal(shouldReplayHubLead({id:2,hubEventStatus:state},'2'),true);
    assert.equal(shouldReplayHubLead({id:1,hubEventStatus:state},'2'),false);
  }
  for(const state of ['sent','failed',undefined])
    assert.equal(shouldReplayHubLead({id:2,hubEventStatus:state},'2'),false);
});
test('invalid replay selection fails closed',()=>{
  for(const selected of ['*','2,','2,wrong','-2','0','2.0'])
    assert.equal(shouldReplayHubLead({id:2,hubEventStatus:'disabled'},selected),false);
});
