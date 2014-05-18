var formulas = [];
var operators = [];
var values = [];
var displayed = [];
var exists = false;
var blank = false;
var screen_name;

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
	
	$('.values').each(function(){
		commafy(this);		
	});
	
	$('#saved_screens').appendTo('div.toolbar');
	
	$('#show_criteria').click(function(){
	  $('#options_row').toggle('slow', function(){
		$('#show_criteria').html('Show Criteria');
	    if($('#options_row').is(':visible')){
	    	$('#show_criteria').html('Hide Criteria');
	    }
	  });
	});
	add_arrows();
});

function commafy(that){
	var no_commas = $(that).val().replace(/,/g, '');
	var is_integer = /^\d+$/;
	if(is_integer.test(no_commas)){
		// add commas to integers to make them easier to read
		var parts = no_commas.toString().split('.');
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		$(that).val(parts.join('.'));
	}
}

$('.values').on('input', function(){
	commafy(this);
});

var name_exists = function(){
	var name_input = $('#name_input');
	screen_name = name_input.val();
	$(name_input).parent('div').removeClass('control-group error');
	$('#save').prop('disabled', false);
	
	if(screen_name==''){
		$(name_input).parent('div').addClass('control-group error');
		$('#save').prop('disabled', true);
		blank = true;
		return false;
	}
	
	$('#saved_screens > select option').each(function(){
		if(this.value===screen_name){
			exists = true;
			return false;
		}
	});
}

$('#name_input').on('input', function(){
	exists = name_exists();
});

$('#save').click(function(){
	name_exists();
	if(exists === true){
		$('#confirm').modal();
		return false;
	}
	if(blank === true){
		return false;
	}
	$(this).prop('disabled', true);
	run_screen(true, screen_name);
});

$('#overwrite').click(function(){
	$(this).prop('disabled', true);
	$(this).siblings('button').prop('disabled', true);
	run_screen(true, screen_name);
});

$(document).on('change', '#saved_screens > select', function(){
	if($(this).prop('selectedIndex') == 0){
		// give them back the default screen
		run_screen('reset', '');
	}else{
		run_screen(false, $(this).find('option:selected').val());
	}
});

$('#reset').click(function(){
	// if they aren't logged in, give them a way to reset the screen
	run_screen('reset', '');
});

$('#run').click(function(){
    run_screen(false, '');
});

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

var run_screen = function(save, id){
	formulas = [];
	operators = [];
	values = [];
	displayed = [];
	
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
	    	var data = $(this).val();
	    	return val == data;
	    }).data('value');
	    
	    if(datalist_value==null){
	    	// means it is user input...remove the commas
	    	var no_commas = val.replace(/,/g, '');
	    	var is_integer = /^\d+$/;
	    	if(is_integer.test(no_commas)){
	    		values.push(no_commas);
	    	}else{
	    		values.push(val);
	    	}
	    }
	    else{
	      values.push(datalist_value);
	    }
	});
	
	$('.displayed :selected').each(function(){
		displayed.push($(this).attr('value'));
	});
	
	d = {'save': save, 'id': id, 'formulas': formulas, 'operators': operators,
		 'values': values, 'displayed': displayed};
	
	d = JSON.stringify(d);
	update_settings({'screener': d}, base_path);	
}



