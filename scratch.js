<div class="row">

<div class="col-sm-4">
<select ng-model="vm.province" size="20" style="width: 100%;height:200px;">
<option ng-click="vm.loadPlaces(0)" value="">None</option>
<option ng-click="vm.loadPlaces(prov.id)" ng-repeat="prov in vm.provinces" value="{{prov}}">{{prov.code + ': ' + prov.name}}</option>
</select>
<p>{{vm.province}}</p>
</div>

<div class="col-sm-4">

<select ng-model="vm.place" size="20" style="width: 100%;height:200px;"">
<option value="" ng-click="vm.loadSuburbs(0)">None</option>
<div vs-repeat>
<option ng-click="vm.loadSuburbs(pl.id)" ng-repeat="pl in vm.places" value="{{pl}}">{{pl.name}}</option>
</div>
</select>
<p>{{vm.place}}</p>

</div>

<div class="col-sm-4">

<select ng-model="vm.suburb" size="20" style="width: 100%;height:200px;"">
<option value="">None</option>
<div vs-repeat>
<option ng-repeat="sub in vm.suburbs" value="{{sub}}">{{sub.name}}</option>
</div>
</select>
<p>{{vm.suburb}}</p>

</div>
</div>
