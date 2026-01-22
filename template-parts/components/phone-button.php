<?php
/**
 * Phone Button Component Template
 *
 * @param array $args {
 *     @type array|bool $phone_data Optional. Array with label, number, icon, icon_position keys. 
 *                                  If false/null, defaults to global header_phone option.
 *     @type string     $class      Optional. Additional classes.
 * }
 */

$defaults = [
    'phone_data' => null,
    'class'      => '',
];

$args = wp_parse_args($args, $defaults);

$phone = $args['phone_data'];

// Fallback to global options if no phone data provided
if (!$phone && function_exists('get_field')) {
    $phone = get_field('global_contact_button', 'option');
}

// Check if valid phone number exists
if (!$phone || empty($phone['number'])) {
    return;
}

$icon_pos = isset($phone['icon_position']) ? $phone['icon_position'] : 'left';
$btn_style = !empty($phone['button_style']) ? $phone['button_style'] : 'btn--secondary';
$btn_class = 'btn ' . $btn_style . ' ' . ($icon_pos === 'right' ? 'btn--icon-right' : 'btn--icon-left');

if (!empty($args['class'])) {
    $btn_class .= ' ' . $args['class'];
}
?>

<a href="tel:<?php echo esc_attr(preg_replace('/[^0-9]/', '', $phone['number'])); ?>" 
    class="<?php echo esc_attr($btn_class); ?>">
    <?php if ($icon_pos === 'left' && !empty($phone['icon'])) : ?>
        <i class="<?php echo esc_attr($phone['icon']); ?>"></i>
    <?php endif; ?>
    
    <?php echo esc_html(!empty($phone['label']) ? $phone['label'] : $phone['number']); ?>

    <?php if ($icon_pos === 'right' && !empty($phone['icon'])) : ?>
        <i class="<?php echo esc_attr($phone['icon']); ?>"></i>
    <?php endif; ?>
</a>
