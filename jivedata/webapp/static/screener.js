var formulas = [];
var operators = [];
var values = [];
var displayed = [];

$(document).ready(function(){
	$("#options_row").show();
	
	$('#datagrid_detail').DataTable({
		paging: false,
		'dom': '<"toolbar">frtip',
		'order': [],
		fnInfoCallback: function(oSettings, iStart, iEnd, iMax, iTotal, sPre){
		  return iTotal + ' Rows';
		}
	});
	
	$('#screen_name').appendTo('div.toolbar');
	
	$('#show_criteria').click(function(){
	  $('#options_row').toggle('slow', function(){
		$('#show_criteria').html('Show Criteria');
	    if($('#options_row').is(':visible')){
	    	$('#show_criteria').html('Hide Criteria');
	    }
	  });
	});
	
	$('#save').click(function(){
		save();
	});
	$('#run').click(function(){
		save();
	});
	
	add_arrows();
});


$("#saved_screens").bind('input', function(){
    alert('hi');
});



var save = function(){
	$('.formulas :selected').each(function(){
		formula = $(this).attr('value');
		formulas.push(formula);
	});
	$('.operators :selected').each(function(){
		operator = $(this).attr('value');
		operators.push(operator);
	});
	
	$('.values').each(function(){
		var val = $(this).val();
		var datalist_id = $(this).attr('list');
	    var datalist_value = $('#' + datalist_id + ' option').filter(function(){
	    	var data = $(this).attr('data-value');
	    	return val == data;
	    }).data('value');
	    
	    if(datalist_value==null){
	      values.push(val);
	    }
	    else{
	      values.push(datalist_value);
	    }
	});
	
	$('.displayed :selected').each(function(){
		displayed.push($(this).attr('value'));
	});
	
	d = JSON.stringify({'formulas': formulas, 'operators': operators,
						'values': values, 'displayed': displayed});
	
	update_settings({'screener': d}, base_path);	
}

$(document).on('click', '.fa-filter', function(){
	last_criteria = $('.criteria:last');
	$(last_criteria.clone()).insertAfter(last_criteria);
	add_arrows();
});

$(document).on('click', '.fa-plus-circle', function(){
	last_column = $('.displayed_columns:last');
	$(last_column.clone()).insertAfter(last_column);
	add_arrows();
});

$(document).on('click', '.remove', function(){
	$(this).parents('.criteria,.displayed_columns').remove();
	add_arrows();
});
$(document).on('click', '.fa-arrow-up', function(){
	var row = $(this).parents('.criteria,.displayed_columns');
	row.insertBefore(row.prev());
	add_arrows();
});
$(document).on('click', '.fa-arrow-down', function(){
	var row = $(this).parents('.criteria,.displayed_columns');
	row.insertAfter(row.next());
	add_arrows();
});


var add_arrows = function(){
	$('.fa-arrow-up,.fa-arrow-down,.remove').each(function(){
		$(this).parent('span').remove();
	});
	
	up_arrow = '<span>&nbsp;&nbsp;<i title="Move Up" class="fa fa-arrow-up"></i></span>';
	down_arrow = '<span>&nbsp;&nbsp;<i title="Move Down" class="fa fa-arrow-down"></i></span>';
	remove = '<span>&nbsp;&nbsp;<i title="Remove" class="remove">&times;</i></span>';
	
	$('.displayed_columns:not(:first) > p').append(up_arrow);
	$('.displayed_columns:not(:last) > p').append(down_arrow);
	
	if($('.criteria').length > 1){
		$('.criteria > p').append(remove);
	}
	if($('.displayed_columns').length > 1){
		$('.displayed_columns > p').append(remove);
	}
		
}



