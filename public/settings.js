define({
    x_speed: 250, // pixels per second
    jump_speed: 700, // pixels per second
    gravity: 2000, // pixels per second per second
    first_floor_y: 40, // pixels from the bottom
    death_start_y: -30, // pixels from the bottom
    death_speed: 10, // pixels per second
    allowed_floor_widths: { lower: 45, upper: 110 }, // pixel range
    /**
     * Pixels at the edge of each floor ignored when calculating
     * the next jump.
     * Basically, bigger numbers should mean fewer really hard jumps.
     */
    edge_leeway: 25,
    /**
     * Seconds between pinging the server with your location
     */
    ping_frequency: 0.1
});
