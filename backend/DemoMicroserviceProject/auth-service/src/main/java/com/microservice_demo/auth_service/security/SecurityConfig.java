package com.microservice_demo.auth_service.security;

import com.microservice_demo.auth_service.security.oauth2.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfiguration) throws Exception{
        return authConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**", "/actuator/**", "/api/otp/**", "/api/password/**",
                                "/api/oauth2/**", "/oauth2/**", "/login/oauth2/**", "/api/email/**", "/api/notifications/**"
                        ).permitAll()
                        .requestMatchers("/api/profile/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_USER")
                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(endpoint -> endpoint.baseUri("/oauth/authorization"))
                        .redirectionEndpoint(endpoint -> endpoint.baseUri("/login/oauth2/code"))
                        .successHandler(oAuth2SuccessHandler)
                        .failureUrl(frontendUrl + "/oauth2/callback?error=oauth2_failed")
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.authenticationProvider(authenticationProvider());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        List<String> origins = Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList();
        corsConfig.setAllowedOrigins(origins);
        corsConfig.setAllowedMethods(
                Arrays.asList("GET", "POST", "PUT", "PATCH" ,"DELETE", "OPTIONS"));
        corsConfig.setAllowedHeaders(List.of("*"));
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }
}
